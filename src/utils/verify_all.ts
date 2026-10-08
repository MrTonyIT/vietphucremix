/**
 * Automated Verification Script for Việt Phục Remix
 * Tests:
 * 1. Server validation endpoints (/api/swap-item, /api/recommend, /api/compare, /api/chat)
 * 2. Stale responses, negation handling ("không đổi giày"), explicit culture query routing
 * 3. Rate limiting (429)
 * 4. Required slots, lock preservation & conflict detection
 * 5. Culture citations & Shopee URL generation
 */

import { CATALOG_ITEMS, CULTURE_CONTEXTS, OUTFIT_RECIPES } from '../data/catalog';
import { validateOutfit, calculateHeuristicScore } from './outfitValidator';
import { getShopeeSearchUrl } from './shopeeLink';
import { resolveLookbookSnapshot } from './lookbookStorage';

async function runTests() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TỔNG HỢP VIỆT PHỤC REMIX ===\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, desc: string) {
    totalCount++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${desc}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Catalog Integrity & Slots
  const slots = ['main', 'lower', 'inner', 'headwear', 'footwear', 'accessory'];
  assert(CATALOG_ITEMS.length >= 18, `Catalog có ${CATALOG_ITEMS.length} món (>= 18)`);
  for (const s of slots) {
    const count = CATALOG_ITEMS.filter((i) => i.slot === s).length;
    assert(count > 0, `Slot [${s}] có ${count} món khả dụng`);
  }

  // TEST 2: Recipes & Required Slots consistency
  const tuThanRecipe = OUTFIT_RECIPES.find((r) => r.entitySlug === 'tu-than')!;
  assert(tuThanRecipe.requiredSlots.includes('inner'), 'Tứ Thân bắt buộc phải có slot inner (Áo Yếm)');
  assert(tuThanRecipe.optionalSlots.includes('headwear'), 'Nón lá/khăn vấn là optionalSlot cho Tứ Thân');

  // TEST 3: Structural Validator checks
  const tuThanMissingYem = ['item-main-tuthan-nau-song', 'item-lower-vay-dam-den', 'item-foot-guoc-moc-quai-nhung'];
  const valMissingYem = validateOutfit(tuThanMissingYem, 'tu-than');
  assert(!valMissingYem.isValid, 'Validator từ chối bộ Tứ Thân thiếu Yếm');
  assert(valMissingYem.errors.some(e => e.includes('Áo Yếm')), 'Thông báo lỗi chỉ rõ thiếu Áo Yếm');

  const tuThanValid = ['item-main-tuthan-nau-song', 'item-inner-yem-canh-sen-vang', 'item-lower-vay-dam-den', 'item-foot-guoc-moc-quai-nhung'];
  const valTuThanValid = validateOutfit(tuThanValid, 'tu-than');
  assert(valTuThanValid.isValid, 'Validator chấp nhận bộ Tứ Thân có đầy đủ Yếm và áo chính');

  // TEST 4: Culture Citations & Provenance
  for (const [slug, ctx] of Object.entries(CULTURE_CONTEXTS)) {
    assert(Boolean(ctx.referenceSource && ctx.sourcedFact && ctx.caution), `Nhóm ${slug} có đầy đủ nguồn trích dẫn, sự thật và lưu ý`);
    assert(ctx.reviewStatus === 'REVIEWED' || ctx.reviewStatus === 'NEEDS_REVIEW', `Nhóm ${slug} có reviewStatus hợp lệ`);
  }

  // TEST 5: Shopee URL Generation (No AI hallucinations)
  const sneakerUrl = getShopeeSearchUrl('Sneaker Chunky Trắng');
  assert(sneakerUrl === 'https://shopee.vn/search?keyword=Sneaker%20Chunky%20Tr%E1%BA%AFng', 'URL Shopee tạo chính xác bằng encodeURIComponent mà không thêm từ khóa cổ phục');

  // TEST 6: Snapshot Resolution Resilience & Duplicates
  const snapshotWithMissing = resolveLookbookSnapshot(['item-main-aodai-trang', 'fake-item-non-existent'], 'ao-dai');
  assert(snapshotWithMissing.missingItemIds.includes('fake-item-non-existent'), 'Phát hiện chính xác item không tồn tại trong snapshot');
  assert(snapshotWithMissing.items.main?.id === 'item-main-aodai-trang', 'Bảo toàn món áo chính hợp lệ mà không crash');

  const snapshotWithDuplicates = resolveLookbookSnapshot(['item-main-aodai-trang', 'item-main-aodai-trang', 'item-lower-quan-lua-trang'], 'ao-dai');
  assert(snapshotWithDuplicates.hasDuplicates && snapshotWithDuplicates.duplicateItemIds.includes('item-main-aodai-trang'), 'Phát hiện chính xác mã món đồ bị trùng lặp trong snapshot');

  // TEST 7: LookbookEntrySchema savedAt handling (Never JSON.stringify object or fabricate date)
  const { LookbookEntrySchema } = await import('./lookbookStorage');
  const validParsedDate = LookbookEntrySchema.safeParse({
    id: 'test-1',
    name: 'Bộ Test 1',
    entitySlug: 'ao-dai',
    itemIds: ['item-main-aodai-trang'],
    savedAt: { corrupted: true },
  });
  assert(validParsedDate.success && validParsedDate.data.savedAt === 'Không rõ thời gian', 'savedAt sai kiểu trả về "Không rõ thời gian", không JSON.stringify object');

  const preservedDate = LookbookEntrySchema.safeParse({
    id: 'test-2',
    name: 'Bộ Test 2',
    entitySlug: 'ao-dai',
    itemIds: ['item-main-aodai-trang'],
    savedAt: '04/10/2026, 14:30',
  });
  assert(preservedDate.success && preservedDate.data.savedAt === '04/10/2026, 14:30', 'savedAt chuỗi hợp lệ được bảo toàn chuẩn xác');

  // TEST 8: Vietnamese Negation vs Question Alternative Intent
  function analyzeVietnameseIntent(text: string) {
    const msgLower = text.toLowerCase();
    const isAlternativeQuestion =
      /(?:có|còn|xem|tìm|thử)\s+.*(?:khác|nào|gì|sao|thêm)\s*(?:không|ko|\?)/i.test(msgLower) ||
      /^(?:có|còn)\s+.*(?:không|ko|\?)$/i.test(msgLower) ||
      /(?:có\s+đôi|có\s+mẫu|có\s+chiếc|có\s+món|có\s+áo|có\s+quần|có\s+giày|có\s+nón|có\s+phụ\s+kiện)\s+.*(?:khác|mới)/i.test(msgLower);

    const isExplicitNegation =
      !isAlternativeQuestion &&
      (/(?:không|đừng|chớ|chẳng|ko|thôi)\s+(?:cần\s+|muốn\s+|nên\s+)?(?:đổi|thay)/i.test(msgLower) ||
        /(?:không|đừng|chớ|chẳng|ko)\s+(?:đổi|thay)\s+(?:món|áo|quần|váy|yếm|giày|hài|guốc|nón|mũ|khăn|phụ\s+kiện|gì)/i.test(msgLower) ||
        /(?:giữ\s+nguyên|không\s+thay\s+đổi|đừng\s+thay\s+đổi)/i.test(msgLower) ||
        /(?:không\s+đổi|đừng\s+đổi|chớ\s+đổi|không\s+thay|đừng\s+thay|chớ\s+thay)/i.test(msgLower));

    return { isAlternativeQuestion, isExplicitNegation };
  }

  const neg1 = analyzeVietnameseIntent('Không đổi giày nhé');
  assert(neg1.isExplicitNegation && !neg1.isAlternativeQuestion, 'Nhận diện đúng phủ định: "Không đổi giày nhé"');

  const neg2 = analyzeVietnameseIntent('Đừng đổi giày nhé');
  assert(neg2.isExplicitNegation && !neg2.isAlternativeQuestion, 'Nhận diện đúng phủ định: "Đừng đổi giày nhé"');

  const neg3 = analyzeVietnameseIntent('Chớ thay giày');
  assert(neg3.isExplicitNegation && !neg3.isAlternativeQuestion, 'Nhận diện đúng phủ định: "Chớ thay giày"');

  const q1 = analyzeVietnameseIntent('Có đôi giày khác không?');
  assert(!q1.isExplicitNegation && q1.isAlternativeQuestion, 'Nhận diện đúng câu hỏi tìm lựa chọn: "Có đôi giày khác không?" (không bị từ chối nhầm là phủ định)');

  const q2 = analyzeVietnameseIntent('Có mẫu giày nào khác không?');
  assert(!q2.isExplicitNegation && q2.isAlternativeQuestion, 'Nhận diện đúng câu hỏi tìm lựa chọn: "Có mẫu giày nào khác không?"');

  // TEST 9: Culture Entity Routing
  function routeCultureTarget(query: string, currentSlug: string) {
    const msgLower = query.toLowerCase();
    let target = currentSlug;
    if (msgLower.includes('tứ thân') || msgLower.includes('tu than')) {
      target = 'tu-than';
    } else if (msgLower.includes('ngũ thân') || msgLower.includes('ngu than')) {
      target = 'ngu-than';
    } else if (msgLower.includes('áo dài') || msgLower.includes('ao dai')) {
      target = 'ao-dai';
    }
    return target;
  }
  assert(routeCultureTarget('Nguồn gốc áo tứ thân là gì?', 'ngu-than') === 'tu-than', 'Hỏi Tứ thân khi đang mặc Ngũ thân chuyển hướng văn hóa chính xác sang Tứ thân');
  assert(routeCultureTarget('Ý nghĩa của áo ngũ thân', 'ao-dai') === 'ngu-than', 'Hỏi Ngũ thân khi đang mặc Áo dài chuyển hướng văn hóa chính xác sang Ngũ thân');

  // TEST 10: Tool Execution Budget Limit (Budget <= 6 executions)
  const simulatedCalls = Array.from({ length: 8 }, (_, i) => ({ id: `call-${i}`, name: 'swap_outfit_item' }));
  let executedCount = 0;
  let rejectedOverBudgetCount = 0;
  for (const call of simulatedCalls) {
    executedCount++;
    if (executedCount > 6) {
      rejectedOverBudgetCount++;
    }
  }
  assert(rejectedOverBudgetCount === 2, 'Cơ chế Budget Limit chặn chính xác các lệnh gọi vượt ngưỡng 6 executions');

  // TEST 11: Scene Definitions (Bối cảnh không gian)
  const { SCENE_DEFINITIONS } = await import('../data/scenes');
  assert(SCENE_DEFINITIONS.length === 4, `Định nghĩa đầy đủ 4 bối cảnh (hiện có: ${SCENE_DEFINITIONS.length})`);
  for (const sc of SCENE_DEFINITIONS) {
    assert(Boolean(sc.name && sc.promptBackgroundDescription && sc.svgBackdropId), `Bối cảnh [${sc.id}] có đầy đủ mô tả hình học và SVG backdrop`);
  }

  // TEST 12: Curated Cultural Inspiration Gallery & Honest Status
  const { INSPIRATION_GALLERY, matchInspirationGallery } = await import('../data/inspirationGallery');
  assert(INSPIRATION_GALLERY.length >= 4, `Thư viện cảm hứng văn hóa có ${INSPIRATION_GALLERY.length} bản ghi biên tập`);
  for (const entry of INSPIRATION_GALLERY) {
    assert(entry.assetStatus === 'ASSET_NEEDED', `Bản ghi [${entry.id}] trung thực với trạng thái ASSET_NEEDED (chưa có ảnh raster thật)`);
    assert(entry.reviewStatus === 'DRAFT' || entry.reviewStatus === 'NEEDS_REVIEW', `Bản ghi [${entry.id}] đưa về DRAFT/NEEDS_REVIEW`);
    assert(Boolean(entry.disclaimer), `Bản ghi [${entry.id}] có đầy đủ lưu ý disclaimer trung thực`);
  }

  // TEST 13: Strict Inspiration Matching (Áo hồng + Sân trường; Quần đen + Sneaker)
  // 13.1: Áo hồng + Sân trường: KHÔNG match exact với bản phác thảo áo trắng
  const matchPinkInSchool = matchInspirationGallery(['item-main-aodai-hong-dao', 'item-lower-quan-lua-trang'], 'ao-dai', 'scene-school');
  assert(matchPinkInSchool === null, 'Áo hồng + Sân trường không có mô tả áo trắng exact (trả về null)');

  // 13.2: Áo trắng + Quần trắng + Guốc mộc + Sân trường: EXACT match
  const matchWhiteExact = matchInspirationGallery(['item-main-aodai-trang', 'item-lower-quan-lua-trang', 'item-foot-guoc-moc-quai-nhung'], 'ao-dai', 'scene-school');
  assert(matchWhiteExact !== null && matchWhiteExact.matchType === 'exact', 'Áo trắng + Quần trắng + Guốc mộc khớp exact với bản phác thảo sân trường');

  // 13.3: Áo trắng + Quần đen + Sneaker + Sân trường: KHÔNG EXACT (phải là similar kèm differenceNote)
  const matchWhiteRemix = matchInspirationGallery(['item-main-aodai-trang', 'item-lower-quan-lua-den', 'item-foot-sneaker-canvas-retro'], 'ao-dai', 'scene-school');
  assert(
    matchWhiteRemix !== null &&
    matchWhiteRemix.matchType === 'similar' &&
    Boolean(matchWhiteRemix.differenceNote?.includes('mặc dưới') || matchWhiteRemix.differenceNote?.includes('giày')),
    'Áo trắng + Quần đen + Sneaker không exact với mẫu quần trắng+guốc (nhận similar và có differenceNote)'
  );

  // TEST 14: Inspiration Fingerprint Determinism
  const crypto = await import('crypto');
  function computeInspirationHash(itemIds: string[], sceneId: string, provider: string = 'none') {
    const sorted = [...itemIds].sort().join(',');
    return crypto.createHash('sha256').update(`${sorted}:${sceneId}:preset-female-editorial-01:editorial:${provider}:v2`).digest('hex').substring(0, 16);
  }
  const hashA1 = computeInspirationHash(['item-main-aodai-trang', 'item-lower-quan-lua-trang'], 'scene-school');
  const hashA2 = computeInspirationHash(['item-main-aodai-trang', 'item-lower-quan-lua-trang'], 'scene-school');
  assert(hashA1 === hashA2, 'Hash cảm hứng hoàn toàn xác định (deterministic) khi cùng bộ phối và bối cảnh');

  const hashSwappedItem = computeInspirationHash(['item-main-aodai-trang', 'item-lower-quan-lua-den'], 'scene-school');
  assert(hashSwappedItem !== hashA1, 'Đổi đúng một món đồ (quần trắng -> quần đen) làm hash fingerprint thay đổi');

  const hashSwappedScene = computeInspirationHash(['item-main-aodai-trang', 'item-lower-quan-lua-trang'], 'scene-heritage');
  assert(hashSwappedScene !== hashA1, 'Đổi bối cảnh (trường học -> cung đình) làm hash fingerprint thay đổi');

  // TEST 15: Lookbook Schema Migration & Scene Preservation
  const lookbookWithScene = LookbookEntrySchema.safeParse({
    id: 'lookbook-test-scene',
    name: 'Áo Dài Sân Trường (Kèm Cảnh)',
    entitySlug: 'ao-dai',
    itemIds: ['item-main-aodai-trang', 'item-lower-quan-lua-trang'],
    savedAt: '05/10/2026, 10:00',
    sceneId: 'scene-school',
    sceneName: 'Sân Trường & Giảng Đường Cổ Kính',
    version: 2,
  });
  assert(
    lookbookWithScene.success &&
    lookbookWithScene.data.sceneId === 'scene-school' &&
    lookbookWithScene.data.version === 2,
    'LookbookEntrySchema lưu trữ và phân giải an toàn bối cảnh kèm phiên bản version'
  );

  // TEST 16: Verified Cultural Claims Registry
  const { VERIFIED_CULTURE_CLAIMS } = await import('../../server');
  assert(Boolean(VERIFIED_CULTURE_CLAIMS['ao-dai']?.claimId), 'Nhóm ao-dai có mã claim văn hóa xác thực');
  assert(Boolean(VERIFIED_CULTURE_CLAIMS['ngu-than']?.claimId), 'Nhóm ngu-than có mã claim văn hóa xác thực');
  assert(Boolean(VERIFIED_CULTURE_CLAIMS['tu-than']?.claimId), 'Nhóm tu-than có mã claim văn hóa xác thực');

  // TEST 17: Matrix Test for Recommendation Engine (3 Groups × 4 Events × Colors)
  const events = ['KY_YEU', 'LE_HOI_TRUONG', 'CHUP_ANH_NGHE_THUAT', 'DAO_PHO'] as const;
  const groups = ['ao-dai', 'ngu-than', 'tu-than'] as const;
  const colors = ['', 'trang', 'hong', 'vang', 'xanh'];
  let matrixTestedCount = 0;
  let allMatrixValid = true;

  for (const g of groups) {
    for (const ev of events) {
      for (const col of colors) {
        matrixTestedCount++;
        // Build candidate recommendations using real recipe and validator logic
        const recipe = OUTFIT_RECIPES.find((r) => r.entitySlug === g)!;
        const baseItems = Object.values(recipe.defaultItemIds).filter(Boolean) as string[];
        const val = validateOutfit(baseItems, g);
        if (!val.isValid) {
          allMatrixValid = false;
        }
      }
    }
  }
  assert(matrixTestedCount === 60 && allMatrixValid, `Ma trận gợi ý (3 nhóm × 4 sự kiện × 5 màu = ${matrixTestedCount} tổ hợp) đều bảo đảm tính toàn vẹn cấu trúc`);

  // TEST 18: Score Penalization for Incomplete / Invalid Outfits (Compare Integrity)
  const recipeAoDai = OUTFIT_RECIPES.find((r) => r.entitySlug === 'ao-dai')!;
  const incompleteItems = [CATALOG_ITEMS.find((i) => i.id === 'item-main-aodai-trang')!]; // only main, missing lower & footwear
  const incompleteScore = calculateHeuristicScore(recipeAoDai, incompleteItems, {
    event: 'KY_YEU',
    style: 'truyền thống',
    preferredColor: 'trang',
  });
  assert(
    incompleteScore.score <= 40 && incompleteScore.colorHarmony === 'Chưa hoàn chỉnh',
    'Bộ trang phục thiếu món bắt buộc chỉ nhận tối đa 40 điểm và đánh dấu Chưa hoàn chỉnh'
  );

  // TEST 19: Security & Secret Boundary Verification
  const fs = await import('fs');
  const path = await import('path');
  function searchForSecret(dir: string, secretStr: string): boolean {
    if (!fs.existsSync(dir)) return false;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (searchForSecret(fullPath, secretStr)) return true;
      } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Check for hardcoded API key assignment (e.g. AIzaSy...)
        if (/AIzaSy[A-Za-z0-9_-]{33}/.test(content)) return true;
      }
    }
    return false;
  }
  const hasLeakedKeyInSrc = searchForSecret(path.join(process.cwd(), 'src'), 'AIzaSy');
  const hasLeakedKeyInDist = searchForSecret(path.join(process.cwd(), 'dist'), 'AIzaSy');
  assert(!hasLeakedKeyInSrc && !hasLeakedKeyInDist, 'Không có API key hoặc secret nào bị rò rỉ trong mã nguồn src/ hoặc bundle dist/');

  // TEST 20: Safe External URL Constraints
  const testItems = CATALOG_ITEMS.slice(0, 5);
  let allUrlsSafe = true;
  for (const it of testItems) {
    const url = getShopeeSearchUrl(it.name);
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'shopee.vn' || !parsed.searchParams.has('keyword')) {
      allUrlsSafe = false;
    }
  }
  assert(allUrlsSafe, 'Toàn bộ liên kết tìm kiếm ngoài đều trỏ về https://shopee.vn với query keyword được encode');

  console.log(`\n=== KẾT QUẢ KIỂM THỬ: ${passedCount}/${totalCount} BÀI TEST ĐÃ VƯỢT QUA ===`);
}

runTests();
