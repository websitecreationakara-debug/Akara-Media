const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const services = [
  // ---------- WEBSITE ----------
  { category: "WEBSITE", name: "Landing Page Website (1 page)", price: 199, priceType: "FIXED", description: "One-page website with contact form, mobile-friendly, delivered in ~1 week." },
  { category: "WEBSITE", name: "Basic Business Website (up to 5 pages)", price: 399, priceType: "FIXED", description: "Home, About, Services, Gallery, Contact. Mobile-friendly, basic SEO setup." },
  { category: "WEBSITE", name: "Standard Business Website (up to 10 pages + CMS)", price: 699, priceType: "FIXED", description: "Content management system so the client can edit content themselves. Blog/news section included." },
  { category: "WEBSITE", name: "E-commerce Website", price: 1200, priceType: "FROM", description: "Online store with products, cart, and payment integration (ABA PayWay/PayPal). Price depends on product count and features." },
  { category: "WEBSITE", name: "Website Redesign", price: 350, priceType: "FROM", description: "Modernize an existing website. Price depends on size and condition of current site." },
  { category: "WEBSITE", name: "Website Maintenance", price: 39, priceType: "PER_MONTH", unitLabel: "per month", description: "Updates, backups, security, small content changes (up to 2 hours/month)." },
  { category: "WEBSITE", name: "Domain + Hosting Setup", price: 80, priceType: "FIXED", description: "Domain registration and hosting setup for the first year, including business email." },
  { category: "WEBSITE", name: "Website Work (hourly)", price: 5, priceType: "PER_HOUR", unitLabel: "per hour", description: "Updates, fixes, and small changes billed by the hour. Set Qty = number of hours." },

  // ---------- MEDIA ----------
  { category: "MEDIA", name: "Logo Design", price: 99, priceType: "FIXED", description: "3 concepts, 2 revision rounds, final files in all formats (PNG, SVG, PDF)." },
  { category: "MEDIA", name: "Full Branding Package", price: 299, priceType: "FIXED", description: "Logo, business card, letterhead, social media kit, and brand color/font guide." },
  { category: "MEDIA", name: "Social Media Post Design", price: 12, priceType: "PER_ITEM", unitLabel: "per post", description: "Single custom-designed post graphic (feed or story size)." },
  { category: "MEDIA", name: "Social Media Design Package (20 posts)", price: 180, priceType: "FIXED", description: "20 branded post designs — better value than per-post pricing." },
  { category: "MEDIA", name: "Product Photography", price: 10, priceType: "PER_ITEM", unitLabel: "per product", description: "White-background or styled product shots, edited. Minimum 10 products." },
  { category: "MEDIA", name: "Photography Half-Day (4 hours)", price: 150, priceType: "FIXED", description: "Event, portrait, or business photography. Includes editing of best shots." },
  { category: "MEDIA", name: "Photography Full-Day (8 hours)", price: 250, priceType: "FIXED", description: "Full-day coverage with edited photo delivery." },
  { category: "MEDIA", name: "Event Video (shoot + edit)", price: 300, priceType: "FROM", description: "Event coverage with edited highlight video (2–5 minutes)." },
  { category: "MEDIA", name: "Promotional Video (30–60 seconds)", price: 350, priceType: "FROM", description: "Scripted promo/ad video: shooting, editing, music, captions." },
  { category: "MEDIA", name: "Video Editing Only", price: 60, priceType: "FROM", unitLabel: "per video", description: "Editing of client-provided footage. Price depends on length and complexity." },
  { category: "MEDIA", name: "Drone Footage Add-on", price: 100, priceType: "FIXED", description: "Aerial shots added to any photo/video package." },
  { category: "MEDIA", name: "Design / Editing Work (hourly)", price: 5, priceType: "PER_HOUR", unitLabel: "per hour", description: "Graphic design, photo editing, or video editing billed by the hour. Set Qty = number of hours." },

  // ---------- MARKETING ----------
  { category: "MARKETING", name: "Social Media Management (1 platform)", price: 180, priceType: "PER_MONTH", unitLabel: "per month", description: "12 posts/month, captions, scheduling, comment/DM monitoring for one platform." },
  { category: "MARKETING", name: "Social Media Management (3 platforms)", price: 350, priceType: "PER_MONTH", unitLabel: "per month", description: "Facebook + Instagram + TikTok: content, scheduling, and engagement." },
  { category: "MARKETING", name: "Facebook / Instagram Ads Management", price: 120, priceType: "PER_MONTH", unitLabel: "per month", description: "Ad setup, targeting, and optimization. Ad budget paid by client separately." },
  { category: "MARKETING", name: "Content Creation Package", price: 200, priceType: "PER_MONTH", unitLabel: "per month", description: "12 posts/month with photos taken at client location once per month." },
  { category: "MARKETING", name: "SEO Starter", price: 200, priceType: "PER_MONTH", unitLabel: "per month", description: "Keyword research, on-page optimization, Google Business Profile, monthly report." },
  { category: "MARKETING", name: "Google Ads Management", price: 150, priceType: "PER_MONTH", unitLabel: "per month", description: "Search ads setup and optimization. Ad budget paid by client separately." },
  { category: "MARKETING", name: "Full Digital Marketing Package", price: 500, priceType: "PER_MONTH", unitLabel: "per month", description: "Social media (2 platforms) + ads management + monthly content shoot + reporting." },
  { category: "MARKETING", name: "Marketing Support (hourly)", price: 5, priceType: "PER_HOUR", unitLabel: "per hour", description: "Consulting, ad setup, or content help billed by the hour. Set Qty = number of hours." },
];

async function main() {
  const count = await prisma.service.count();
  if (count === 0) {
    let i = 0;
    for (const s of services) {
      await prisma.service.create({ data: { ...s, sortOrder: i++ } });
    }
    console.log(`Seeded ${services.length} services.`);
  } else {
    console.log("Services already exist, skipping seed.");
  }
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, email: "marketingpromotion.akara@gmail.com" },
  });
  console.log("Settings ready.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
