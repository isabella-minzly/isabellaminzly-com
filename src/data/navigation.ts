// Site navigation, in the order and wording of the Figma component "NavigationMenu".
// `ready: false` pages are generated as "Under construction" until their design is approved.

export interface NavItem {
  label: string;
  href: string;
  ready: boolean;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { label: 'Home', href: '/', ready: true },
  { label: 'My HCLSoftware: the case study', href: '/my-hclsoftware/', ready: true },
  { label: 'BigFix: the case study', href: '/bigfix/', ready: true },
  {
    label: 'Mandala Design System',
    href: '/mandala/',
    ready: true,
    children: [
      { label: 'Case study: Human-governed, AI\u2011powered', href: '/mandala/', ready: true },
      { label: 'Accessible by design', href: '/mandala/accessibility/', ready: true },
      { label: 'The colour story', href: '/mandala/colour/', ready: true },
      { label: 'Typography, a study on internationalisation', href: '/mandala/typography/', ready: true },
      { label: 'Mandala: The story behind the name', href: '/mandala/name/', ready: true },
    ],
  },
  { label: 'Training and speaking: Accessibility for Inclusion', href: '/accessibility-for-inclusion/', ready: true },
  { label: 'Individual contribution and leadership', href: '/leadership/', ready: true },
  { label: 'Design for fitness and training', href: '/fitness-and-training/', ready: false },
  {
    label: 'About me',
    href: '/about/',
    ready: false,
    children: [{ label: 'Inspiration', href: '/about/inspiration/', ready: false }],
  },
];

export const allNavItems: NavItem[] = navigation.flatMap((item) => [item, ...(item.children ?? [])]);

export const footerLinks = {
  linkedIn: 'https://www.linkedin.com/in/isabella-minzly/',
  accessibilityStatement: '/accessibility-statement/',
};
