/**
 * Test Utility: Verify Recommendation Product Count
 * ─────────────────────────────────────────────────
 * This utility logs and verifies that the displayed recommendation count
 * matches what's in the database/API response
 */

export const testRecommendationCount = {
  /**
   * Log recommendation data for verification
   * @param productId - The product ID being viewed
   * @param displayedCount - Number of recommendations displayed
   * @param recommendations - Array of recommendation products
   */
  logRecommendationData: (
    productId: number,
    displayedCount: number,
    recommendations: any[]
  ) => {
    console.group('📊 RECOMMENDATION COUNT VERIFICATION');
    console.log('Product ID:', productId);
    console.log('Displayed Count:', displayedCount);
    console.log('Actual Array Length:', recommendations.length);
    console.log('Match:', displayedCount === recommendations.length ? '✅ PASS' : '❌ FAIL');
    console.log('Recommendations:', recommendations.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.min_price,
    })));
    console.groupEnd();

    // Return verification result
    return {
      passed: displayedCount === recommendations.length,
      displayedCount,
      actualCount: recommendations.length,
      recommendations: recommendations.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
      })),
    };
  },

  /**
   * Compare frontend count with API response count
   * @param apiResponse - API response containing recommendations
   * @param displayedProducts - Products shown in UI
   */
  compareCountsWithAPI: (apiResponse: any, displayedProducts: any[]) => {
    const apiCount = apiResponse?.data?.recommendations?.length || 0;
    const displayCount = displayedProducts.length;

    const result = {
      apiCount,
      displayCount,
      mismatch: apiCount !== displayCount,
      verified: apiCount === displayCount,
    };

    console.group('🔍 API vs DISPLAY COUNT COMPARISON');
    console.log('API Response Count:', apiCount);
    console.log('Display Count:', displayCount);
    console.log('Verified:', result.verified ? '✅ YES' : '❌ NO');
    console.log('Result:', result);
    console.groupEnd();

    return result;
  },
};

/**
 * Integration Test for Recommendation Carousel
 * Usage in component:
 * 
 * useEffect(() => {
 *   if (recommendations.length > 0) {
 *     const verification = testRecommendationCount.logRecommendationData(
 *       product?.id || 0,
 *       recommendationCount,
 *       recommendations
 *     );
 *     // If verification fails, log warning
 *     if (!verification.passed) {
 *       console.warn('⚠️ Recommendation count mismatch!', verification);
 *     }
 *   }
 * }, [recommendations, recommendationCount]);
 */
