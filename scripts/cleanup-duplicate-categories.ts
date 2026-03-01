import { init } from "@instantdb/admin";
import * as fs from "fs";
import * as path from "path";

// .env.localを読み込む
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;
const ADMIN_TOKEN = process.env.INSTANT_APP_ADMIN_TOKEN!;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error("環境変数が設定されていません");
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function cleanupDuplicateCategories() {
  console.log("重複カテゴリをクリーンアップしています...");

  // 全ユーザーとそのカテゴリを取得
  const { $users } = await db.query({
    $users: {
      categories: {},
    },
  });

  console.log(`\n${$users.length} 人のユーザーが見つかりました`);

  // 各ユーザーの重複カテゴリを削除
  const txs = [];
  let totalDuplicates = 0;

  for (const user of $users) {
    const cats = (user as any).categories || [];
    if (cats.length === 0) continue;

    console.log(`\nユーザー ${user.id}: ${cats.length} 個のカテゴリ`);

    // 名前ごとにグループ化
    const nameGroups = new Map<string, any[]>();

    for (const cat of cats) {
      const name = cat.name;
      if (!nameGroups.has(name)) {
        nameGroups.set(name, []);
      }
      nameGroups.get(name)!.push(cat);
    }

    // 重複を削除（最初の1つだけ残す）
    for (const [name, group] of nameGroups.entries()) {
      if (group.length > 1) {
        console.log(`  "${name}": ${group.length} 個の重複を検出`);

        // order が最小のものを残す（最初に作成されたもの）
        group.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // 2番目以降を削除
        for (let i = 1; i < group.length; i++) {
          console.log(`    削除: ${group[i].id} (order: ${group[i].order})`);
          txs.push(db.tx.categories[group[i].id].delete());
          totalDuplicates++;
        }
      }
    }
  }

  if (txs.length > 0) {
    console.log(`\n合計 ${totalDuplicates} 個の重複カテゴリを削除します...`);
    await db.transact(txs);
    console.log("✅ クリーンアップ完了！");
  } else {
    console.log("\n重複カテゴリは見つかりませんでした");
  }
}

cleanupDuplicateCategories().catch(console.error);
