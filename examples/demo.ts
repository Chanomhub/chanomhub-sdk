/**
 * Chanomhub SDK Demo
 *
 * ตัวอย่างการใช้งาน SDK สำหรับ Chanomhub API
 * รันด้วย: npx ts-node examples/demo.ts
 */

import { createChanomhubClient, createAuthenticatedClient, resolveImageUrl } from '../index';

async function main() {
    console.log('🚀 Chanomhub SDK Demo\n');
    console.log('='.repeat(50));

    // ============================================================================
    // 1. สร้าง Client แบบ Public (ไม่ต้อง Login)
    // ============================================================================
    console.log('\n📦 1. สร้าง Client (Public Access)\n');

    const sdk = createChanomhubClient();
    console.log('✅ Client created with config:');
    console.log(`   API URL: ${sdk.config.apiUrl}`);
    console.log(`   CDN URL: ${sdk.config.cdnUrl}`);
    console.log(`   Cache: ${sdk.config.defaultCacheSeconds}s`);

    // ============================================================================
    // 2. ดึง Articles ทั้งหมด (Public)
    // ============================================================================
    console.log('\n📝 2. ดึง Articles ทั้งหมด\n');

    try {
        const articles = await sdk.articles.getAll({ limit: 5 });
        console.log(`✅ พบ ${articles.length} บทความ:\n`);

        articles.forEach((article, index) => {
            console.log(`   ${index + 1}. ${article.title}`);
            console.log(`      Slug: ${article.slug}`);
            console.log(`      Author: ${article.author?.name || 'Unknown'}`);
            console.log(`      Favorites: ❤️ ${article.favoritesCount}`);
            if (article.mainImage) {
                console.log(
                    `      Image: ${resolveImageUrl(article.mainImage, sdk.config.cdnUrl)}`,
                );
            }
            console.log();
        });
    } catch (error) {
        console.error('❌ Error fetching articles:', error);
    }

    // ============================================================================
    // 3. ดึง Articles ตาม Tag
    // ============================================================================
    console.log('\n🏷️  3. ดึง Articles ตาม Tag\n');

    try {
        const rengyArticles = await sdk.articles.getByTag('renpy', { limit: 3 });
        console.log(`✅ พบ ${rengyArticles.length} บทความที่มี tag "renpy":\n`);

        rengyArticles.forEach((article) => {
            console.log(`   - ${article.title} (${article.slug})`);
        });
    } catch (error) {
        console.error('❌ Error fetching articles by tag:', error);
    }

    // ============================================================================
    // 4. ดึง Articles ตาม Platform
    // ============================================================================
    console.log('\n💻 4. ดึง Articles ตาม Platform\n');

    try {
        const windowsArticles = await sdk.articles.getByPlatform('windows', { limit: 3 });
        console.log(`✅ พบ ${windowsArticles.length} บทความสำหรับ "windows":\n`);

        windowsArticles.forEach((article) => {
            console.log(`   - ${article.title}`);
        });
    } catch (error) {
        console.error('❌ Error fetching articles by platform:', error);
    }

    // ============================================================================
    // 5. ดึง Article ตาม Slug (ข้อมูลเต็ม)
    // ============================================================================
    console.log('\n📖 5. ดึงข้อมูล Article ตาม Slug\n');

    try {
        // ใช้ slug จาก articles ที่ดึงมาก่อนหน้า
        const firstArticles = await sdk.articles.getAll({ limit: 1 });
        if (firstArticles.length > 0) {
            const slug = firstArticles[0].slug;
            console.log(`   กำลังดึงข้อมูล: ${slug}\n`);

            const article = await sdk.articles.getBySlug(slug);
            if (article) {
                console.log(`✅ รายละเอียดบทความ:\n`);
                console.log(`   Title: ${article.title}`);
                console.log(`   Description: ${article.description?.substring(0, 100)}...`);
                console.log(`   Engine: ${article.engine?.name || 'N/A'}`);
                console.log(`   Version: ${article.ver || 'N/A'}`);
                console.log(`   Tags: ${article.tags?.map((t) => t.name).join(', ') || 'None'}`);
                console.log(
                    `   Platforms: ${article.platforms?.map((p) => p.name).join(', ') || 'None'}`,
                );
                console.log(`   Created: ${article.createdAt}`);
                console.log(`   Mods: ${article.mods?.length || 0} mods`);
            }
        }
    } catch (error) {
        console.error('❌ Error fetching article by slug:', error);
    }

    // ============================================================================
    // 6. ดึง Article พร้อม Downloads
    // ============================================================================
    console.log('\n⬇️  6. ดึง Article พร้อม Downloads\n');

    try {
        const firstArticles = await sdk.articles.getAll({ limit: 1 });
        if (firstArticles.length > 0) {
            const slug = firstArticles[0].slug;
            const result = await sdk.articles.getWithDownloads(slug);

            if (result.article) {
                console.log(`✅ บทความ: ${result.article.title}\n`);

                if (result.downloads && result.downloads.length > 0) {
                    console.log(`   📥 Downloads (${result.downloads.length}):`);
                    result.downloads.forEach((dl) => {
                        console.log(`      - ${dl.name} ${dl.vipOnly ? '(VIP)' : ''}`);
                    });
                } else {
                    console.log('   📥 ไม่มี downloads');
                }

                if (result.article.officialDownloadSources?.length) {
                    console.log(
                        `   🔗 Official Sources (${result.article.officialDownloadSources.length}):`,
                    );
                    result.article.officialDownloadSources.forEach((src) => {
                        console.log(`      - ${src.name}: ${src.url}`);
                    });
                }
            }
        }
    } catch (error) {
        console.error('❌ Error fetching article with downloads:', error);
    }

    // ============================================================================
    // 7. ใช้ Field Presets
    // ============================================================================
    console.log('\n🎯 7. ใช้ Field Presets\n');

    try {
        // Minimal preset - เร็วที่สุด เหมาะสำหรับ cards
        console.log('   📋 Minimal preset (สำหรับ cards):');
        const minimalArticles = await sdk.articles.getAll({
            limit: 2,
            preset: 'minimal',
        });
        minimalArticles.forEach((a) => {
            console.log(`      - ${a.title} (id: ${a.id})`);
        });

        // Custom fields
        console.log('\n   🔧 Custom fields (เลือกเอง):');
        const customArticles = await sdk.articles.getAll({
            limit: 2,
            fields: ['id', 'title', 'favoritesCount', 'engine'],
        });
        customArticles.forEach((a) => {
            console.log(
                `      - ${a.title} | ❤️ ${a.favoritesCount} | Engine: ${a.engine?.name || 'N/A'}`,
            );
        });
    } catch (error) {
        console.error('❌ Error with presets:', error);
    }

    // ============================================================================
    // 8. สร้าง Client แบบ Authenticated
    // ============================================================================
    console.log('\n🔐 8. Authenticated Client (ตัวอย่าง)\n');

    // ตัวอย่างการสร้าง client แบบ login แล้ว
    const authSdk = createAuthenticatedClient('your-jwt-token-here', {
        // สามารถ override config ได้
        defaultCacheSeconds: 0,
    });

    console.log('✅ Authenticated client created:');
    console.log(`   Has token: ${!!authSdk.config.token}`);
    console.log(`   Cache disabled: ${authSdk.config.defaultCacheSeconds === 0}`);

    // ============================================================================
    // 9. Raw GraphQL Query
    // ============================================================================
    console.log('\n🔮 9. Raw GraphQL Query\n');

    try {
        const query = `
      query CustomQuery {
        articles(limit: 2, status: PUBLISHED) {
          id
          title
          tags {
            name
          }
        }
      }
    `;

        const { data, errors } = await sdk.graphql<{
            articles: Array<{ id: number; title: string; tags: Array<{ name: string }> }>;
        }>(query, {}, { operationName: 'CustomQuery' });

        if (data) {
            console.log('✅ Raw GraphQL Result:\n');
            data.articles.forEach((a) => {
                console.log(`   - ${a.title}`);
                console.log(`     Tags: ${a.tags.map((t) => t.name).join(', ')}`);
            });
        }

        if (errors) {
            console.log('❌ GraphQL Errors:', errors);
        }
    } catch (error) {
        console.error('❌ Error with raw query:', error);
    }

    // ============================================================================
    // สรุป
    // ============================================================================
    console.log('\n' + '='.repeat(50));
    console.log('✨ Demo Complete!\n');
    console.log('📚 สรุปการใช้งาน SDK:\n');
    console.log('   1. createChanomhubClient()     - สร้าง client');
    console.log('   2. sdk.articles.getAll()       - ดึง articles ทั้งหมด');
    console.log('   3. sdk.articles.getByTag()     - ดึงตาม tag');
    console.log('   4. sdk.articles.getByPlatform()- ดึงตาม platform');
    console.log('   5. sdk.articles.getByCategory()- ดึงตาม category');
    console.log('   6. sdk.articles.getBySlug()    - ดึง article เดียว');
    console.log('   7. sdk.articles.getWithDownloads() - ดึงพร้อม downloads');
    console.log('   8. sdk.graphql()               - Raw GraphQL query');
    console.log('\n🔗 Docs: https://github.com/Chanomhub/chanomhub-sdk');
}

main().catch(console.error);
