const Excel = require("exceljs");
const fs = require("fs");
var rimraf = require("rimraf");

const i18nDir = "../app/i18n";
const translationsDir = `${i18nDir}/translations`;

// Create dir
if (fs.existsSync(translationsDir)) {
  rimraf(translationsDir, () => {
    fs.mkdirSync(translationsDir);
  });
} else {
  fs.mkdirSync(translationsDir);
}

const file = "./translations.xlsx";
const wb = new Excel.Workbook();

wb.xlsx.readFile(file).then(function () {
  const sh = wb.getWorksheet("Sheet1");

  // Create files
  const fileNames = [];
  for (i = 1; i <= sh.columnCount; i++) {
    const filePrefix = sh.getRow(2).getCell(i).value;
    if (filePrefix) {
      fileNames.push(filePrefix);
      const fileDir = `${translationsDir}/${filePrefix}.js`;

      fs.writeFileSync(fileDir, "export default {\n");
    }
  }

  // Write files
  for (i = 3; i <= sh.rowCount; i++) {
    let key = sh.getRow(i).getCell(1).value;

    if (key) {
      const translationsValues = [
        sh.getRow(i).getCell(2).value, // ptBR
        sh.getRow(i).getCell(3).value, // en
        sh.getRow(i).getCell(4).value, // enUS
        sh.getRow(i).getCell(5).value, // enUK
        sh.getRow(i).getCell(6).value, // enIE
        sh.getRow(i).getCell(7).value, // esAR
        sh.getRow(i).getCell(8).value, // esCL
        sh.getRow(i).getCell(9).value, // es
        sh.getRow(i).getCell(10).value, // esMX
        sh.getRow(i).getCell(11).value, // esUY
        sh.getRow(i).getCell(12).value, // de
        sh.getRow(i).getCell(13).value, // fr
        sh.getRow(i).getCell(14).value, // it
        sh.getRow(i).getCell(15).value, // nd
        sh.getRow(i).getCell(16).value // ptPT
      ];

      for (j = 0; j < fileNames.length; j++) {
        const fileName = fileNames[j];
        const fileDir = `${translationsDir}/${fileName}.js`;
        const value = translationsValues[j];

        if (key.indexOf(".") > -1) {
          key = key.split(".").join("_");
        }

        fs.appendFileSync(fileDir, `${key}: `);
        fs.appendFileSync(fileDir, `"${value ? value : ""}",\n`);
      }
    }
  }

  fs.writeFileSync(`${i18nDir}/index.js`, `
    import RNLanguages from 'react-native-languages';
    import I18n from 'i18n-js';

  `);

  fileNames.sort();
  fileNames.forEach(fileName => {
    const fileDir = `${translationsDir}/${fileName}.js`;
    fs.appendFileSync(fileDir, "}");

    const stringWrite = `import ${fileName.replace('-', '')} from './translations/${fileName}.js';\n`;
    fs.appendFileSync(`${i18nDir}/index.js`, stringWrite);
  });

  fs.appendFileSync(`${i18nDir}/index.js`, `
    I18n.locale = RNLanguages.language;
    I18n.fallbacks = true;
    I18n.fallbackLng = 'en';
    I18n.translations = {
  `);

  fileNames.forEach(fileName => {
    const stringWrite = `\'${fileName}\': ${fileName.replace('-', '')},\n`;
    fs.appendFileSync(`${i18nDir}/index.js`, stringWrite);
  });

  fs.appendFileSync(`${i18nDir}/index.js`, `
    };

    export default I18n;
  `);

  console.log("Ready!");


});
