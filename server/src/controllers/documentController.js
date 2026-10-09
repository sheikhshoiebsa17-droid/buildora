import Document from '../models/Document.js';
import path from 'path';
import fs from 'fs';
import { UPLOAD_DIR, validateFileContent } from '../middleware/upload.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['category', 'project', 'visibility'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: rx }, { description: rx }];
    }
    const [items, total] = await Promise.all([
      Document.find(query).sort(sort).skip(skip).limit(limit).populate('project', 'name code').lean(),
      Document.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    let fileMeta = {};
    if (req.file) {
      await validateFileContent(req.file.path, req.file.mimetype);
      fileMeta = {
        fileName: req.file.originalname,
        fileUrl: `/api/documents/${req.file.filename}/raw`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    } else if (req.body.url) {
      fileMeta = { fileUrl: req.body.url, mimeType: 'link/external' };
    } else {
      return res.fail('Attach a file or provide a link URL.', 400);
    }

    const doc = await Document.create({
      organization: req.user.organization,
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category || 'other',
      project: req.body.project || undefined,
      customer: req.body.customer || undefined,
      visibility: req.body.visibility || 'staff',
      tags: req.body.tags ? String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
      versions: [{ fileName: fileMeta.fileName || 'Link', fileUrl: fileMeta.fileUrl, uploadedBy: req.user._id }],
      ...fileMeta,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: doc });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const doc = await Document.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('project', 'name code');
    if (!doc) return res.fail('Document not found', 404);
    res.ok({ data: doc });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Document.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!doc) return res.fail('Document not found', 404);
    for (const f of ['title', 'description', 'category', 'visibility']) {
      if (req.body[f] !== undefined) doc[f] = req.body[f];
    }
    doc.updatedBy = req.user._id;
    await doc.save();
    res.ok({ data: doc });
  } catch (err) {
    next(err);
  }
}

/** Authenticated download — files are never publicly served */
export async function download(req, res, next) {
  try {
    const storedName = path.basename(req.params.id);
    const filePath = path.join(UPLOAD_DIR, storedName);
    const doc = await Document.findOne({ fileUrl: { $regex: storedName }, organization: req.user.organization });
    if (!doc || !fs.existsSync(filePath)) return res.fail('File not found', 404);
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.fileName || 'download')}"`);
    res.status(200);
    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
}
