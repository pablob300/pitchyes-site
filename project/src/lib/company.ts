// Dados institucionais da PitchYes — fonte única para o rodapé e o JSON-LD da Organization.
// Copiados do site oficial (pitchyes.com.br, set/2026): rodapé, lista de redes do código dele
// e o selo "RA Verificada". O endereço por extenso (`address.full`) é lido pelo rodapé,
// /contato, /privacidade, /sobre e /llms.txt. O telefone ainda aparece por extenso em
// /contato e /privacidade: mudou, confira lá também.

export const company = {
  phone: { display: "+55 (11) 5196-9381", tel: "+551151969381" },
  email: "comercial@pitchyes.com.br",
  address: {
    /** Como aparece no site, no formato aprovado pela empresa (out/2026). */
    full: "Av. T-7, 371 - 20º andar - St. Oeste, Goiânia - GO, 74140-110",
    // Partes separadas para o JSON-LD da Organization (PostalAddress).
    street: "Av. T-7, 371, 20º andar",
    district: "Setor Oeste",
    city: "Goiânia",
    state: "GO",
    postalCode: "74140-110",
    country: "BR",
  },
  reclameAqui: "https://www.reclameaqui.com.br/empresa/pitchyes-desenvolvimento/",
} as const;

export type Social = {
  label: string;
  href: string;
  /** SVG path in a 24×24 viewBox, drawn with fill="currentColor". */
  path: string;
  /** Instagram's glyph is a ring with holes: it needs the even-odd rule. */
  evenOdd?: boolean;
};

// Same order and profiles as the official site's footer.
export const socials: Social[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/pitchyes",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.64-1.6-2.64-1.61 0-1.86 1.26-1.86 2.56v4.91h-4V9.75Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/pitchyesai",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5.25-3.9a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z",
    evenOdd: true,
  },
  { label: "YouTube", href: "https://www.youtube.com/@PitchYes", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "TikTok", href: "https://www.tiktok.com/@pitchyesai", path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" },
  { label: "Facebook", href: "https://www.facebook.com/pitchyes", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
];
