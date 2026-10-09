import React from 'react';
import Hero from '../components/home/Hero.jsx';
import AudienceBar from '../components/home/AudienceBar.jsx';
import ProblemSection from '../components/home/ProblemSection.jsx';
import WorkflowSection from '../components/home/WorkflowSection.jsx';
import ProblemToSolution from '../components/home/ProblemToSolution.jsx';
import ModulesSection from '../components/home/ModulesSection.jsx';
import ImpactSection from '../components/home/ImpactSection.jsx';
import CopilotSection from '../components/home/CopilotSection.jsx';
import PortalSection from '../components/home/PortalSection.jsx';
import CTASection from '../components/home/CTASection.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <AudienceBar />
      <ProblemSection />
      <WorkflowSection />
      <ProblemToSolution />
      <ModulesSection />
      <ImpactSection />
      <CopilotSection />
      <PortalSection />
      <CTASection />
    </>
  );
}
