import * as fs from 'fs';
import * as path from 'path';

async function joinJsonFiles() {
  const jsonDir = path.join(__dirname, '../public/');
  const outputFilePath = path.join(jsonDir, 'combined.json');

  const combinedData: any[] = [];

  for (let i = 1; i <= 1600; i++) {
    const filePath = path.join(jsonDir, `${i}.json`);

    // ファイルが存在するかどうか確認
    if (!fs.existsSync(filePath)) {
      console.error(`File ${i}.json does not exist.`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    combinedData.push(jsonData);
  }

  // 結合したデータを新しいJSONファイルとして出力
  fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2));
  console.log(`Combined JSON saved to ${outputFilePath}`);
}

joinJsonFiles().catch(error => {
  console.error('An error occurred:', error);
});
