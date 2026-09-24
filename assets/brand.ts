/**
 * EquiFlow / Thien Ma Equestrian Club - Brand Identity Constants
 * Tệp cấu hình thông tin thương hiệu, nhận diện và tài nguyên đồ họa cốt lõi.
 */

export const BRAND = {
  shortName: 'TMEC',
  fullName: 'THIEN MA EQUESTRIAN CLUB',
  vietnameseName: 'Câu Lạc Bộ Đua Ngựa Thiên Mã',
  displayName: 'THIEN MA',
  tagline: 'Every horse. One journey forward.',
  emailDomain: '@gmail.com',
  supportEmail: 'support@equiflow.vn',
  hotline: '024 3771 2088',
  logo: {
    path: './images/logo-fivegates.svg',
    alt: 'Thien Ma Equestrian Club - Five Gates Logo',
    meaning: '5 gates representing 5 roles protecting the central horse profile',
    primaryColor: '#2B2E33', // Than chì (--ink)
    accentColor: '#8C2F39',  // Đỏ Burgundy (--accent)
  },
  editorialImage: {
    path: './images/equine-editorial.webp',
    alt: 'Equestrian Heritage Editorial Photography',
  },
} as const;

export type BrandConfig = typeof BRAND;
