// Populates the JSON data store with clearly-marked demo data so the
// directory, map and schemes pages are immediately demonstrable.
// Run with: npm run seed  (from /server)
const { collection } = require('./db');
const { hashPassword } = require('./utils/auth');

const Users = collection('users');
const Entrepreneurs = collection('entrepreneurs');
const Schemes = collection('schemes');

function reset(name) {
  collection(name).replaceAll([]);
}

console.log('Seeding database...');
reset('users');
reset('entrepreneurs');
reset('schemes');

// ---------- Admin ----------
Users.insert({
  name: 'Portal Admin',
  phone: '9999999999',
  email: 'admin@entrepreneurs-portal.gov.in',
  passwordHash: hashPassword('admin123'),
  role: 'admin',
});

// ---------- Demo entrepreneurs (marked as sample data) ----------
const demoBusinesses = [
  {
    businessName: "Meera Bandhani Works",
    entrepreneurName: 'Meera Solanki',
    phone: '9820011122',
    category: 'Handicrafts',
    description: 'DEMO DATA. Hand-tied Bandhani dupattas and sarees made using traditional Gujarati tie-dye techniques passed down three generations.',
    productsServices: 'Bandhani sarees, dupattas, cushion covers, custom dyeing',
    address: 'Jamalpur Market Road',
    district: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    latitude: 23.0225,
    longitude: 72.5714,
    needsSupport: true,
    verificationStatus: 'verified',
  },
  {
    businessName: "Patel's Home Pickles",
    entrepreneurName: 'Rekha Patel',
    phone: '9820011123',
    category: 'Food',
    description: 'DEMO DATA. Home-made Gujarati pickles, papad and snacks prepared in small batches using family recipes.',
    productsServices: 'Mango pickle, chili pickle, papad, chhundo',
    address: 'Maninagar Cross Road',
    district: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380008',
    latitude: 23.0058,
    longitude: 72.6021,
    needsSupport: true,
    verificationStatus: 'verified',
  },
  {
    businessName: 'Blue Pottery Jaipur',
    entrepreneurName: 'Anil Kumhar',
    phone: '9820011124',
    category: 'Artisans',
    description: 'DEMO DATA. Traditional Jaipur blue pottery — vases, tiles and tableware, hand-painted with cobalt oxide glazes.',
    productsServices: 'Vases, tiles, plates, decorative pieces',
    address: 'Sanganer Road',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302029',
    latitude: 26.8206,
    longitude: 75.7996,
    needsSupport: true,
    verificationStatus: 'verified',
  },
  {
    businessName: 'Rajasthani Tailors',
    entrepreneurName: 'Salim Khan',
    phone: '9820011125',
    category: 'Tailoring',
    description: 'DEMO DATA. Custom stitching for men and women, specializing in traditional Rajasthani jodhpuri and bandhgala outfits.',
    productsServices: 'Custom stitching, alterations, jodhpuri suits',
    address: 'Sojati Gate',
    district: 'Jodhpur',
    state: 'Rajasthan',
    pincode: '342001',
    latitude: 26.2839,
    longitude: 73.0243,
    needsSupport: false,
    verificationStatus: 'pending',
  },
  {
    businessName: 'Banarasi Silk Weavers',
    entrepreneurName: 'Iqbal Ansari',
    phone: '9820011126',
    category: 'Handicrafts',
    description: 'DEMO DATA. Handloom Banarasi silk sarees woven on traditional pit looms using zari work.',
    productsServices: 'Banarasi silk sarees, dupattas, stoles',
    address: 'Madanpura',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221001',
    latitude: 25.2823,
    longitude: 82.9861,
    needsSupport: true,
    verificationStatus: 'verified',
  },
  {
    businessName: 'Deccan Metal Works',
    entrepreneurName: 'Suresh Jadhav',
    phone: '9820011127',
    category: 'Small Manufacturing',
    description: 'DEMO DATA. Small-scale metal fabrication unit producing agricultural hand tools and household hardware.',
    productsServices: 'Hand tools, hinges, custom metal fabrication',
    address: 'Hadapsar Industrial Estate',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411013',
    latitude: 18.5089,
    longitude: 73.9260,
    needsSupport: true,
    verificationStatus: 'pending',
  },
  {
    businessName: 'Green Valley Organic Farms',
    entrepreneurName: 'Muthu Selvam',
    phone: '9820011128',
    category: 'Agriculture',
    description: 'DEMO DATA. Small organic farm growing millets and vegetables, supplying local markets directly from farm.',
    productsServices: 'Millets, seasonal vegetables, organic compost',
    address: 'Thondamuthur Road',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641109',
    latitude: 11.0022,
    longitude: 76.8874,
    needsSupport: true,
    verificationStatus: 'verified',
  },
  {
    businessName: 'Kochi Coir Products',
    entrepreneurName: 'Beena Thomas',
    phone: '9820011129',
    category: 'Local Services',
    description: 'DEMO DATA. Coir doormats, ropes and eco-friendly packaging material made from local coconut husk.',
    productsServices: 'Coir mats, ropes, eco-packaging',
    address: 'Fort Kochi',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '682001',
    latitude: 9.9658,
    longitude: 76.2422,
    needsSupport: false,
    verificationStatus: 'verified',
  },
  {
    businessName: 'Gond Art Studio',
    entrepreneurName: 'Rekha Uikey',
    phone: '9820011130',
    category: 'Home-based Businesses',
    description: 'DEMO DATA. Traditional Gond tribal art on canvas, home decor items and greeting cards, painted at home.',
    productsServices: 'Gond paintings, greeting cards, wall decor',
    address: 'Ratibad',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462046',
    latitude: 23.2599,
    longitude: 77.4126,
    needsSupport: true,
    verificationStatus: 'pending',
  },
  {
    businessName: 'Assam Bamboo Crafts',
    entrepreneurName: 'Diganta Bora',
    phone: '9820011131',
    category: 'Artisans',
    description: 'DEMO DATA. Handwoven bamboo and cane furniture, baskets and household items using local Assamese techniques.',
    productsServices: 'Bamboo furniture, baskets, mats',
    address: 'Fancy Bazaar',
    district: 'Guwahati',
    state: 'Assam',
    pincode: '781001',
    latitude: 26.1876,
    longitude: 91.7495,
    needsSupport: true,
    verificationStatus: 'verified',
  },
];

demoBusinesses.forEach((biz) => {
  const user = Users.insert({
    name: biz.entrepreneurName,
    phone: biz.phone,
    email: '',
    passwordHash: hashPassword('demo1234'),
    role: 'entrepreneur',
  });
  Entrepreneurs.insert({
    userId: user.id,
    ...biz,
    image: '',
    socialLink: '',
    businessStatus: 'active',
  });
});

// ---------- Government schemes (seed/static data, real known official links only) ----------
const schemes = [
  {
    name: 'PM Employment Generation Programme (PMEGP)',
    description: 'A credit-linked subsidy scheme that helps set up new micro-enterprises, offering margin money subsidy on bank loans for manufacturing and service units.',
    eligibility: 'Individuals above 18 years; no income ceiling for setting up new projects under the general category.',
    benefits: 'Subsidy of 15-35% of project cost depending on category and area (rural/urban); balance as bank loan.',
    documents: 'Aadhaar card, project report, caste/category certificate (if applicable), education certificate.',
    categories: ['Handicrafts', 'Food', 'Small Manufacturing', 'Tailoring', 'Artisans'],
    officialUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
  },
  {
    name: 'PM Vishwakarma Scheme',
    description: 'Support scheme for traditional artisans and craftspeople working with their hands and tools, covering 18 trades.',
    eligibility: 'Artisans and craftspeople engaged in one of the 18 identified trades, working through hands and tools.',
    benefits: 'Skill training, toolkit incentive, collateral-free credit support, and marketing assistance.',
    documents: 'Aadhaar card, trade proof/certificate, bank account details.',
    categories: ['Artisans', 'Handicrafts', 'Tailoring', 'Small Manufacturing'],
    officialUrl: 'https://pmvishwakarma.gov.in/',
  },
  {
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    description: 'Provides collateral-free loans up to ₹10 lakh to non-corporate, non-farm small and micro enterprises under Shishu, Kishor and Tarun categories.',
    eligibility: 'Any Indian citizen with a business plan for a non-farm income-generating activity.',
    benefits: 'Loans up to ₹10 lakh without collateral, offered through banks, NBFCs and MFIs.',
    documents: 'Identity proof, address proof, business plan, passport-size photos.',
    categories: ['All'],
    officialUrl: 'https://www.mudra.org.in/',
  },
  {
    name: 'Stand-Up India Scheme',
    description: 'Facilitates bank loans for setting up greenfield enterprises, aimed at women and SC/ST entrepreneurs.',
    eligibility: 'SC/ST and/or women entrepreneurs above 18 years, for greenfield (first-time) enterprises.',
    benefits: 'Bank loans between ₹10 lakh and ₹1 crore for setting up a new enterprise.',
    documents: 'Identity proof, address proof, business project report, caste certificate (if applicable).',
    categories: ['Small Manufacturing', 'Local Services', 'Food'],
    officialUrl: 'https://www.standupmitra.in/',
  },
  {
    name: 'PM Formalisation of Micro Food Processing Enterprises (PM FME)',
    description: 'Supports formalisation and upgrade of existing micro food processing enterprises, including individuals and self-help groups.',
    eligibility: 'Existing micro food processing units, individuals, FPOs, self-help groups and cooperatives.',
    benefits: 'Credit-linked subsidy of 35% of eligible project cost, common infrastructure and branding support.',
    documents: 'Aadhaar card, business registration (if any), bank account details, project report.',
    categories: ['Food'],
    officialUrl: 'https://pmfme.mofpi.gov.in/',
  },
  {
    name: 'National Rural Livelihood Mission (NRLM / Aajeevika)',
    description: 'Promotes self-help groups and community institutions among rural poor households, with access to financial services and livelihood support.',
    eligibility: 'Rural poor households, especially women, willing to join or form self-help groups.',
    benefits: 'Revolving fund, community investment support, bank linkage and skill training.',
    documents: 'Aadhaar card, BPL/household verification, bank account details.',
    categories: ['Agriculture', 'Home-based Businesses', 'Local Services'],
    officialUrl: 'https://aajeevika.gov.in/',
  },
];

schemes.forEach((s) => Schemes.insert(s));

console.log(`Seeded ${Users.all().length} users, ${Entrepreneurs.all().length} entrepreneurs, ${Schemes.all().length} schemes.`);
console.log('\nAdmin login -> phone: 9999999999  password: admin123');
console.log('Demo entrepreneur login -> phone: 9820011122  password: demo1234 (any demo phone works, same password)\n');
