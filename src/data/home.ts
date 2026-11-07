// Landing page copy, word for word from the Figma frame "Landing page" (approved 7 November 2026).
import myHclSoftware from '../assets/landing/my-hclsoftware.png';
import bigFix from '../assets/landing/bigfix.png';
import accessibilityForInclusion from '../assets/landing/accessibility-for-inclusion.png';

export const hero = {
  greeting: 'Hej, I am Isabella',
  headline: ['Human-governed', 'AI-powered', 'Designing for everyone'],
  intro:
    'Design leader specialising in scalable UI architecture, operational accessibility and enterprise design capability across complex product ecosystems.',
  cta: { label: 'Say hello', hiddenSuffix: ' on LinkedIn', href: 'https://www.linkedin.com/in/isabella-minzly/' },
};

export const stats = [
  { number: '700+', label: 'people trained in accessibility' },
  { number: '6+', label: 'BigFix products on one architecture' },
  { number: '$2M', label: 'saved by building My HCLSoftware in-house' },
  { number: '10', label: 'designers, led across Italy and India' },
];

export const highlights = [
  { title: 'Zero to product', text: 'My HCLSoftware began on a blank screen, and customer satisfaction roughly doubled.' },
  { title: 'New look, same trust', text: 'A modern BigFix interface that its loyal users still recognise as their own.' },
  { title: 'AI with guardrails', text: 'Rules and gates I wrote keep Mandala fast to build and the judgement human.' },
  {
    title: 'Accessibility: a floor, not a target',
    text: 'It is always about people. Building products that meet legal standards is a welcome side effect.',
  },
];

export const caseStudies = {
  heading: 'Case studies',
  intro:
    'I build systems that scale, not single solutions. Some of my work shows up in the products and some sits underneath them: the architecture, standards and training that enable multiple teams to build outstanding experiences without starting from scratch.',
  cards: [
    {
      title: 'My HCLSoftware',
      text: 'It began with research and a blank screen, and became the foundation that Marketplace, BigFix and Mandala now stand on.',
      link: 'Read My HCLSoftware case study',
      href: '/my-hclsoftware/',
      image: { src: myHclSoftware, alt: 'The My HCLSoftware home screen on a laptop' },
    },
    {
      title: 'BigFix',
      text: 'I designed the BigFix UI architecture from the first grid to the last chart, and I lead the teams that carry it into every screen, in a role created for me.',
      link: 'Read BigFix case study',
      href: '/bigfix/',
      image: { src: bigFix, alt: '', maxWidth: 90 },
    },
    {
      title: 'Mandala Design System',
      text: 'Accessibility-first, token-driven and AI-readable: the design system I am building with AI at HCLSoftware, with rules I wrote and gates I hold keeping design and code in sync.',
      link: 'Read Mandala case study',
      href: '/mandala/',
      image: 'mandala' as const,
    },
    {
      title: 'Accessibility for Inclusion',
      text: 'The story behind the programme, how its twelve sessions work, and why training can become something people compete to win and what I share on stage when I speak at conferences and events.',
      link: 'Read Accessibility case study',
      href: '/accessibility-for-inclusion/',
      image: { src: accessibilityForInclusion, alt: '' },
    },
  ],
};
