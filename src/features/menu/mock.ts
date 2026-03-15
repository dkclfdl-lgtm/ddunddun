import type { MenuCategory, MenuItem, MenuFormData, CategoryFormData } from './types';

let mockCategories: MenuCategory[] = [
  { id: 'cat-1', brandId: 'brand-1', name: '튀김', code: 'C001', sortOrder: 1, isActive: true, itemCount: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-2', brandId: 'brand-1', name: '마른안주', code: 'C002', sortOrder: 2, isActive: true, itemCount: 4, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-3', brandId: 'brand-1', name: '탕', code: 'C003', sortOrder: 3, isActive: true, itemCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-4', brandId: 'brand-1', name: '특별메뉴', code: 'C004', sortOrder: 4, isActive: true, itemCount: 4, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-5', brandId: 'brand-1', name: '주류', code: 'C005', sortOrder: 5, isActive: true, itemCount: 8, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-6', brandId: 'brand-1', name: '음료', code: 'C006', sortOrder: 6, isActive: true, itemCount: 4, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-7', brandId: 'brand-1', name: '칵테일', code: 'C007', sortOrder: 7, isActive: true, itemCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-8', brandId: 'brand-1', name: '서비스', code: 'C008', sortOrder: 8, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-9', brandId: 'brand-1', name: '직원호출', code: 'C009', sortOrder: 9, isActive: false, itemCount: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-10', brandId: 'brand-1', name: '추가메뉴', code: 'C010', sortOrder: 10, isActive: true, itemCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-11', brandId: 'brand-1', name: '보드카', code: 'C016', sortOrder: 11, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-12', brandId: 'brand-1', name: '전', code: 'C020', sortOrder: 12, isActive: true, itemCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-13', brandId: 'brand-1', name: '치킨', code: 'C021', sortOrder: 13, isActive: true, itemCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-14', brandId: 'brand-1', name: '떡볶이', code: 'C022', sortOrder: 14, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-15', brandId: 'brand-1', name: '과일', code: 'C023', sortOrder: 15, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-16', brandId: 'brand-1', name: '사이드메뉴', code: 'C026', sortOrder: 16, isActive: true, itemCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-17', brandId: 'brand-1', name: '양주', code: 'C027', sortOrder: 17, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-18', brandId: 'brand-1', name: '찜', code: 'C030', sortOrder: 18, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-19', brandId: 'brand-1', name: '바틀', code: 'C042', sortOrder: 19, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'cat-20', brandId: 'brand-1', name: '막걸리', code: 'C057', sortOrder: 20, isActive: true, itemCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
];

let mockMenuItems: MenuItem[] = [
  // 주류 (cat-5)
  { id: 'item-1', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '참이슬', code: 'D001', barcode: '8801007', price: 5108, costPrice: 1200, description: '참이슬 오리지널 360ml', imageUrl: 'https://picsum.photos/seed/soju1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 15230, revenue: 77805240, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-2', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '처음처럼 새로', code: 'D002', barcode: '8801007002', price: 5113, costPrice: 1200, description: '처음처럼 새로 360ml', imageUrl: 'https://picsum.photos/seed/soju2/200/200', isAvailable: true, isPopular: true, sortOrder: 2, salesCount: 12450, revenue: 63656850, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-3', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '카스', code: 'D003', barcode: '8801007003', price: 5032, costPrice: 1500, description: '카스 프레시 500ml', imageUrl: 'https://picsum.photos/seed/beer1/200/200', isAvailable: true, isPopular: true, sortOrder: 3, salesCount: 11300, revenue: 56861600, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-4', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '살얼음맥주500cc', code: 'D004', barcode: '8801007004', price: 4700, costPrice: 1000, description: '살얼음 생맥주 500cc', imageUrl: 'https://picsum.photos/seed/beer2/200/200', isAvailable: true, isPopular: true, sortOrder: 4, salesCount: 9870, revenue: 46389000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-5', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '테라', code: 'D005', barcode: '8801007005', price: 5032, costPrice: 1500, description: '테라 500ml', imageUrl: 'https://picsum.photos/seed/beer3/200/200', isAvailable: true, isPopular: false, sortOrder: 5, salesCount: 7650, revenue: 38494800, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-6', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '진로', code: 'D006', barcode: null, price: 5108, costPrice: 1200, description: '진로 이즈 백 360ml', imageUrl: 'https://picsum.photos/seed/soju3/200/200', isAvailable: true, isPopular: false, sortOrder: 6, salesCount: 6320, revenue: 32282560, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-7', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '살얼음맥주1000cc', code: 'D007', barcode: null, price: 9400, costPrice: 2000, description: '살얼음 생맥주 1000cc', imageUrl: 'https://picsum.photos/seed/beer4/200/200', isAvailable: true, isPopular: false, sortOrder: 7, salesCount: 5100, revenue: 47940000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-8', categoryId: 'cat-5', categoryName: '주류', brandId: 'brand-1', name: '소맥세트', code: 'D008', barcode: null, price: 10140, costPrice: 2500, description: '소주+맥주 세트', imageUrl: null, isAvailable: true, isPopular: true, sortOrder: 8, salesCount: 8200, revenue: 83148000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 튀김 (cat-1)
  { id: 'item-9', categoryId: 'cat-1', categoryName: '튀김', brandId: 'brand-1', name: '강릉감자', code: 'F001', barcode: null, price: 9102, costPrice: 3000, description: '강릉식 감자전', imageUrl: 'https://picsum.photos/seed/fry1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 8900, revenue: 81007800, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-10', categoryId: 'cat-1', categoryName: '튀김', brandId: 'brand-1', name: '오징어튀김', code: 'F002', barcode: null, price: 14200, costPrice: 5000, description: '바삭한 오징어튀김', imageUrl: 'https://picsum.photos/seed/fry2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 5670, revenue: 80514000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-11', categoryId: 'cat-1', categoryName: '튀김', brandId: 'brand-1', name: '새우튀김', code: 'F003', barcode: null, price: 15800, costPrice: 6000, description: '대왕 새우튀김', imageUrl: 'https://picsum.photos/seed/fry3/200/200', isAvailable: true, isPopular: true, sortOrder: 3, salesCount: 4320, revenue: 68256000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-12', categoryId: 'cat-1', categoryName: '튀김', brandId: 'brand-1', name: '고구마튀김', code: 'F004', barcode: null, price: 8500, costPrice: 2500, description: '달콤한 고구마튀김', imageUrl: 'https://picsum.photos/seed/fry4/200/200', isAvailable: true, isPopular: false, sortOrder: 4, salesCount: 3210, revenue: 27285000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-13', categoryId: 'cat-1', categoryName: '튀김', brandId: 'brand-1', name: '모듬튀김', code: 'F005', barcode: null, price: 18000, costPrice: 7000, description: '모듬튀김 세트', imageUrl: 'https://picsum.photos/seed/fry5/200/200', isAvailable: false, isPopular: false, sortOrder: 5, salesCount: 2100, revenue: 37800000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 음료 (cat-6)
  { id: 'item-14', categoryId: 'cat-6', categoryName: '음료', brandId: 'brand-1', name: '콜라', code: 'B001', barcode: '8801007010', price: 2500, costPrice: 800, description: '코카콜라 355ml', imageUrl: 'https://picsum.photos/seed/drink1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 6780, revenue: 16950000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-15', categoryId: 'cat-6', categoryName: '음료', brandId: 'brand-1', name: '사이다', code: 'B002', barcode: '8801007011', price: 2500, costPrice: 800, description: '칠성사이다 355ml', imageUrl: 'https://picsum.photos/seed/drink2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 5430, revenue: 13575000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-16', categoryId: 'cat-6', categoryName: '음료', brandId: 'brand-1', name: '제로콜라', code: 'B003', barcode: '8801007012', price: 3000, costPrice: 900, description: '코카콜라 제로 355ml', imageUrl: 'https://picsum.photos/seed/drink3/200/200', isAvailable: true, isPopular: true, sortOrder: 3, salesCount: 4560, revenue: 13680000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-17', categoryId: 'cat-6', categoryName: '음료', brandId: 'brand-1', name: '토닉워터', code: 'B004', barcode: null, price: 3500, costPrice: 1000, description: '토닉워터 200ml', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 4, salesCount: 2340, revenue: 8190000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 탕 (cat-3)
  { id: 'item-18', categoryId: 'cat-3', categoryName: '탕', brandId: 'brand-1', name: '부대찌개', code: 'S001', barcode: null, price: 13000, costPrice: 5000, description: '부대찌개 2인분', imageUrl: 'https://picsum.photos/seed/soup1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 7890, revenue: 102570000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-19', categoryId: 'cat-3', categoryName: '탕', brandId: 'brand-1', name: '김치찌개', code: 'S002', barcode: null, price: 11000, costPrice: 4000, description: '김치찌개 2인분', imageUrl: 'https://picsum.photos/seed/soup2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 5670, revenue: 62370000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-20', categoryId: 'cat-3', categoryName: '탕', brandId: 'brand-1', name: '순두부찌개', code: 'S003', barcode: null, price: 10000, costPrice: 3500, description: '순두부찌개', imageUrl: 'https://picsum.photos/seed/soup3/200/200', isAvailable: true, isPopular: false, sortOrder: 3, salesCount: 4230, revenue: 42300000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 치킨 (cat-13)
  { id: 'item-21', categoryId: 'cat-13', categoryName: '치킨', brandId: 'brand-1', name: '후라이드치킨', code: 'CK001', barcode: null, price: 18000, costPrice: 7000, description: '바삭한 후라이드치킨', imageUrl: 'https://picsum.photos/seed/chicken1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 6540, revenue: 117720000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-22', categoryId: 'cat-13', categoryName: '치킨', brandId: 'brand-1', name: '양념치킨', code: 'CK002', barcode: null, price: 19000, costPrice: 7500, description: '매콤달콤 양념치킨', imageUrl: 'https://picsum.photos/seed/chicken2/200/200', isAvailable: true, isPopular: true, sortOrder: 2, salesCount: 5890, revenue: 111910000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-23', categoryId: 'cat-13', categoryName: '치킨', brandId: 'brand-1', name: '간장치킨', code: 'CK003', barcode: null, price: 19000, costPrice: 7500, description: '달콤한 간장치킨', imageUrl: 'https://picsum.photos/seed/chicken3/200/200', isAvailable: false, isPopular: false, sortOrder: 3, salesCount: 3210, revenue: 60990000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 특별메뉴 (cat-4)
  { id: 'item-24', categoryId: 'cat-4', categoryName: '특별메뉴', brandId: 'brand-1', name: '불닭볶음면', code: 'SP001', barcode: null, price: 8000, costPrice: 2500, description: '매운 불닭볶음면', imageUrl: 'https://picsum.photos/seed/special1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 4560, revenue: 36480000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-25', categoryId: 'cat-4', categoryName: '특별메뉴', brandId: 'brand-1', name: '치즈볼', code: 'SP002', barcode: null, price: 7500, costPrice: 2000, description: '모짜렐라 치즈볼', imageUrl: 'https://picsum.photos/seed/special2/200/200', isAvailable: true, isPopular: true, sortOrder: 2, salesCount: 6780, revenue: 50850000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-26', categoryId: 'cat-4', categoryName: '특별메뉴', brandId: 'brand-1', name: '떡갈비', code: 'SP003', barcode: null, price: 14000, costPrice: 5500, description: '수제 떡갈비', imageUrl: 'https://picsum.photos/seed/special3/200/200', isAvailable: true, isPopular: false, sortOrder: 3, salesCount: 3450, revenue: 48300000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-27', categoryId: 'cat-4', categoryName: '특별메뉴', brandId: 'brand-1', name: '골뱅이무침', code: 'SP004', barcode: null, price: 16000, costPrice: 6000, description: '매콤한 골뱅이무침', imageUrl: 'https://picsum.photos/seed/special4/200/200', isAvailable: true, isPopular: true, sortOrder: 4, salesCount: 5120, revenue: 81920000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 전 (cat-12)
  { id: 'item-28', categoryId: 'cat-12', categoryName: '전', brandId: 'brand-1', name: '해물파전', code: 'J001', barcode: null, price: 15000, costPrice: 5500, description: '해물파전', imageUrl: 'https://picsum.photos/seed/jeon1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 7890, revenue: 118350000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-29', categoryId: 'cat-12', categoryName: '전', brandId: 'brand-1', name: '김치전', code: 'J002', barcode: null, price: 12000, costPrice: 4000, description: '바삭한 김치전', imageUrl: 'https://picsum.photos/seed/jeon2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 4560, revenue: 54720000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-30', categoryId: 'cat-12', categoryName: '전', brandId: 'brand-1', name: '부추전', code: 'J003', barcode: null, price: 10000, costPrice: 3000, description: '부추전', imageUrl: 'https://picsum.photos/seed/jeon3/200/200', isAvailable: true, isPopular: false, sortOrder: 3, salesCount: 3200, revenue: 32000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 마른안주 (cat-2)
  { id: 'item-31', categoryId: 'cat-2', categoryName: '마른안주', brandId: 'brand-1', name: '오징어채', code: 'DR001', barcode: null, price: 12000, costPrice: 4000, description: '버터구이 오징어채', imageUrl: 'https://picsum.photos/seed/dry1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 3450, revenue: 41400000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-32', categoryId: 'cat-2', categoryName: '마른안주', brandId: 'brand-1', name: '먹태', code: 'DR002', barcode: null, price: 14000, costPrice: 5000, description: '구운 먹태', imageUrl: 'https://picsum.photos/seed/dry2/200/200', isAvailable: true, isPopular: true, sortOrder: 2, salesCount: 5670, revenue: 79380000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-33', categoryId: 'cat-2', categoryName: '마른안주', brandId: 'brand-1', name: '육포', code: 'DR003', barcode: null, price: 15000, costPrice: 6000, description: '프리미엄 육포', imageUrl: 'https://picsum.photos/seed/dry3/200/200', isAvailable: true, isPopular: false, sortOrder: 3, salesCount: 2890, revenue: 43350000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-34', categoryId: 'cat-2', categoryName: '마른안주', brandId: 'brand-1', name: '견과류모듬', code: 'DR004', barcode: null, price: 10000, costPrice: 4000, description: '견과류 모듬', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 4, salesCount: 1890, revenue: 18900000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 칵테일 (cat-7)
  { id: 'item-35', categoryId: 'cat-7', categoryName: '칵테일', brandId: 'brand-1', name: '모히또', code: 'CT001', barcode: null, price: 9000, costPrice: 3000, description: '라임 모히또', imageUrl: 'https://picsum.photos/seed/cocktail1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 4560, revenue: 41040000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-36', categoryId: 'cat-7', categoryName: '칵테일', brandId: 'brand-1', name: '하이볼', code: 'CT002', barcode: null, price: 8000, costPrice: 2500, description: '위스키 하이볼', imageUrl: 'https://picsum.photos/seed/cocktail2/200/200', isAvailable: true, isPopular: true, sortOrder: 2, salesCount: 6780, revenue: 54240000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-37', categoryId: 'cat-7', categoryName: '칵테일', brandId: 'brand-1', name: '레몬사와', code: 'CT003', barcode: null, price: 7500, costPrice: 2000, description: '상큼한 레몬사와', imageUrl: 'https://picsum.photos/seed/cocktail3/200/200', isAvailable: true, isPopular: false, sortOrder: 3, salesCount: 3450, revenue: 25875000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 떡볶이 (cat-14)
  { id: 'item-38', categoryId: 'cat-14', categoryName: '떡볶이', brandId: 'brand-1', name: '로제떡볶이', code: 'TK001', barcode: null, price: 12000, costPrice: 4000, description: '크리미 로제떡볶이', imageUrl: 'https://picsum.photos/seed/tteok1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 5430, revenue: 65160000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-39', categoryId: 'cat-14', categoryName: '떡볶이', brandId: 'brand-1', name: '매운떡볶이', code: 'TK002', barcode: null, price: 10000, costPrice: 3500, description: '매운 떡볶이', imageUrl: 'https://picsum.photos/seed/tteok2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 3890, revenue: 38900000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 과일 (cat-15)
  { id: 'item-40', categoryId: 'cat-15', categoryName: '과일', brandId: 'brand-1', name: '과일모듬', code: 'FR001', barcode: null, price: 20000, costPrice: 10000, description: '계절 과일 모듬', imageUrl: 'https://picsum.photos/seed/fruit1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 2340, revenue: 46800000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-41', categoryId: 'cat-15', categoryName: '과일', brandId: 'brand-1', name: '수박주스', code: 'FR002', barcode: null, price: 8000, costPrice: 3000, description: '생수박주스', imageUrl: 'https://picsum.photos/seed/fruit2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 1890, revenue: 15120000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 추가메뉴 (cat-10)
  { id: 'item-42', categoryId: 'cat-10', categoryName: '추가메뉴', brandId: 'brand-1', name: '공기밥', code: 'AD001', barcode: null, price: 1000, costPrice: 300, description: '공기밥', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 12340, revenue: 12340000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-43', categoryId: 'cat-10', categoryName: '추가메뉴', brandId: 'brand-1', name: '계란후라이', code: 'AD002', barcode: null, price: 2000, costPrice: 500, description: '계란후라이', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 6780, revenue: 13560000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-44', categoryId: 'cat-10', categoryName: '추가메뉴', brandId: 'brand-1', name: '치즈추가', code: 'AD003', barcode: null, price: 2000, costPrice: 700, description: '치즈 추가 토핑', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 3, salesCount: 5430, revenue: 10860000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 사이드메뉴 (cat-16)
  { id: 'item-45', categoryId: 'cat-16', categoryName: '사이드메뉴', brandId: 'brand-1', name: '감자샐러드', code: 'SD001', barcode: null, price: 8000, costPrice: 3000, description: '감자샐러드', imageUrl: 'https://picsum.photos/seed/side1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 2340, revenue: 18720000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-46', categoryId: 'cat-16', categoryName: '사이드메뉴', brandId: 'brand-1', name: '소세지구이', code: 'SD002', barcode: null, price: 12000, costPrice: 4500, description: '모듬 소세지구이', imageUrl: 'https://picsum.photos/seed/side2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 3120, revenue: 37440000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-47', categoryId: 'cat-16', categoryName: '사이드메뉴', brandId: 'brand-1', name: '군만두', code: 'SD003', barcode: null, price: 7000, costPrice: 2500, description: '군만두', imageUrl: 'https://picsum.photos/seed/side3/200/200', isAvailable: true, isPopular: false, sortOrder: 3, salesCount: 4560, revenue: 31920000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 찜 (cat-18)
  { id: 'item-48', categoryId: 'cat-18', categoryName: '찜', brandId: 'brand-1', name: '아구찜', code: 'JM001', barcode: null, price: 35000, costPrice: 15000, description: '아구찜 2인분', imageUrl: 'https://picsum.photos/seed/jjim1/200/200', isAvailable: true, isPopular: true, sortOrder: 1, salesCount: 2340, revenue: 81900000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-49', categoryId: 'cat-18', categoryName: '찜', brandId: 'brand-1', name: '해물찜', code: 'JM002', barcode: null, price: 38000, costPrice: 16000, description: '해물찜 2인분', imageUrl: 'https://picsum.photos/seed/jjim2/200/200', isAvailable: false, isPopular: false, sortOrder: 2, salesCount: 1560, revenue: 59280000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 양주 (cat-17)
  { id: 'item-50', categoryId: 'cat-17', categoryName: '양주', brandId: 'brand-1', name: '잭다니엘', code: 'WK001', barcode: null, price: 12000, costPrice: 5000, description: '잭다니엘 싱글샷', imageUrl: 'https://picsum.photos/seed/whisky1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 2340, revenue: 28080000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-51', categoryId: 'cat-17', categoryName: '양주', brandId: 'brand-1', name: '발렌타인', code: 'WK002', barcode: null, price: 15000, costPrice: 7000, description: '발렌타인 싱글샷', imageUrl: 'https://picsum.photos/seed/whisky2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 1230, revenue: 18450000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 막걸리 (cat-20)
  { id: 'item-52', categoryId: 'cat-20', categoryName: '막걸리', brandId: 'brand-1', name: '생막걸리', code: 'MK001', barcode: null, price: 5000, costPrice: 1500, description: '국산 생막걸리', imageUrl: 'https://picsum.photos/seed/makgeolli1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 4560, revenue: 22800000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-53', categoryId: 'cat-20', categoryName: '막걸리', brandId: 'brand-1', name: '복숭아막걸리', code: 'MK002', barcode: null, price: 6000, costPrice: 2000, description: '복숭아 막걸리', imageUrl: 'https://picsum.photos/seed/makgeolli2/200/200', isAvailable: true, isPopular: true, sortOrder: 2, salesCount: 3780, revenue: 22680000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 바틀 (cat-19)
  { id: 'item-54', categoryId: 'cat-19', categoryName: '바틀', brandId: 'brand-1', name: '잭다니엘바틀', code: 'BT001', barcode: null, price: 150000, costPrice: 60000, description: '잭다니엘 700ml 바틀', imageUrl: 'https://picsum.photos/seed/bottle1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 340, revenue: 51000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-55', categoryId: 'cat-19', categoryName: '바틀', brandId: 'brand-1', name: '발렌타인바틀', code: 'BT002', barcode: null, price: 180000, costPrice: 80000, description: '발렌타인 700ml 바틀', imageUrl: 'https://picsum.photos/seed/bottle2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 210, revenue: 37800000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 보드카 (cat-11)
  { id: 'item-56', categoryId: 'cat-11', categoryName: '보드카', brandId: 'brand-1', name: '앱솔루트', code: 'VK001', barcode: null, price: 10000, costPrice: 4000, description: '앱솔루트 보드카 싱글샷', imageUrl: 'https://picsum.photos/seed/vodka1/200/200', isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 1890, revenue: 18900000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-57', categoryId: 'cat-11', categoryName: '보드카', brandId: 'brand-1', name: '스미노프', code: 'VK002', barcode: null, price: 9000, costPrice: 3500, description: '스미노프 보드카 싱글샷', imageUrl: 'https://picsum.photos/seed/vodka2/200/200', isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 1230, revenue: 11070000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 서비스 (cat-8)
  { id: 'item-58', categoryId: 'cat-8', categoryName: '서비스', brandId: 'brand-1', name: '서비스안주', code: 'SV001', barcode: null, price: 0, costPrice: 2000, description: '서비스 안주', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 8900, revenue: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
  { id: 'item-59', categoryId: 'cat-8', categoryName: '서비스', brandId: 'brand-1', name: '서비스음료', code: 'SV002', barcode: null, price: 0, costPrice: 800, description: '서비스 음료', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 2, salesCount: 5670, revenue: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },

  // 직원호출 (cat-9)
  { id: 'item-60', categoryId: 'cat-9', categoryName: '직원호출', brandId: 'brand-1', name: '직원호출', code: 'ST001', barcode: null, price: 0, costPrice: 0, description: '직원 호출 버튼', imageUrl: null, isAvailable: true, isPopular: false, sortOrder: 1, salesCount: 45000, revenue: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z' },
];

export function getMenuCategories(): MenuCategory[] {
  return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getMenuCategoryById(id: string): MenuCategory | undefined {
  return mockCategories.find((c) => c.id === id);
}

export function getMenuItems(): MenuItem[] {
  return [...mockMenuItems];
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return mockMenuItems.find((item) => item.id === id);
}

export function createMenuItem(data: MenuFormData): MenuItem {
  const category = mockCategories.find((c) => c.id === data.categoryId);
  const newItem: MenuItem = {
    id: `item-${Date.now()}`,
    categoryId: data.categoryId,
    categoryName: category?.name ?? '',
    brandId: 'brand-1',
    name: data.name,
    code: data.code,
    barcode: null,
    price: data.price,
    costPrice: data.costPrice,
    description: data.description,
    imageUrl: null,
    isAvailable: data.isAvailable,
    isPopular: data.isPopular,
    sortOrder: mockMenuItems.filter((i) => i.categoryId === data.categoryId).length + 1,
    salesCount: 0,
    revenue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockMenuItems = [...mockMenuItems, newItem];
  // 카테고리 아이템 수 업데이트
  mockCategories = mockCategories.map((c) =>
    c.id === data.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c
  );
  return newItem;
}

export function updateMenuItem(id: string, data: Partial<MenuFormData>): MenuItem | undefined {
  let updated: MenuItem | undefined;
  mockMenuItems = mockMenuItems.map((item) => {
    if (item.id === id) {
      const category = data.categoryId
        ? mockCategories.find((c) => c.id === data.categoryId)
        : undefined;
      updated = {
        ...item,
        ...data,
        categoryName: category?.name ?? item.categoryName,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    }
    return item;
  });
  return updated;
}

export function deleteMenuItem(id: string): boolean {
  const item = mockMenuItems.find((i) => i.id === id);
  if (!item) return false;
  mockMenuItems = mockMenuItems.filter((i) => i.id !== id);
  mockCategories = mockCategories.map((c) =>
    c.id === item.categoryId ? { ...c, itemCount: Math.max(0, c.itemCount - 1) } : c
  );
  return true;
}

export function createCategory(data: CategoryFormData): MenuCategory {
  const maxOrder = mockCategories.reduce((max, c) => Math.max(max, c.sortOrder), 0);
  const newCat: MenuCategory = {
    id: `cat-${Date.now()}`,
    brandId: 'brand-1',
    name: data.name,
    code: data.code,
    sortOrder: maxOrder + 1,
    isActive: data.isActive,
    itemCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockCategories = [...mockCategories, newCat];
  return newCat;
}

export function updateCategory(id: string, data: Partial<CategoryFormData>): MenuCategory | undefined {
  let updated: MenuCategory | undefined;
  mockCategories = mockCategories.map((c) => {
    if (c.id === id) {
      updated = { ...c, ...data, updatedAt: new Date().toISOString() };
      return updated;
    }
    return c;
  });
  return updated;
}

export function deleteCategory(id: string): boolean {
  const hasItems = mockMenuItems.some((i) => i.categoryId === id);
  if (hasItems) return false;
  mockCategories = mockCategories.filter((c) => c.id !== id);
  return true;
}

export function reorderCategories(orderedIds: string[]): MenuCategory[] {
  mockCategories = mockCategories.map((c) => {
    const newOrder = orderedIds.indexOf(c.id);
    return newOrder >= 0 ? { ...c, sortOrder: newOrder + 1, updatedAt: new Date().toISOString() } : c;
  });
  return getMenuCategories();
}
