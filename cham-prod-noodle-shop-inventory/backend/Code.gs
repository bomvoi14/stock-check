/**
 * Stock Check ERP v2.6 backend.
 * Deploy as Google Apps Script Web App after backing up the spreadsheet.
 * The Transaction ID column is added at the end of the existing log.
 */
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function doGet(e) {
  var name = e && e.parameter && e.parameter.sheet || 'catalog';
  if (name === 'catalog') name = 'ตั้งค่าสินค้า';
  if (name === 'บันทึกสต๊อก') name = 'ธุรกรรมสต๊อก';
  if (name !== 'ตั้งค่าสินค้า' && name !== 'ธุรกรรมสต๊อก') return json_({status:'error',message:'Invalid sheet'});
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  return json_(sheet ? sheet.getDataRange().getValues() : []);
}
function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({status:'error',message:'Busy, retry later'});
  try {
    var payload = JSON.parse(e.postData.contents);
    var items = Array.isArray(payload) ? payload : [payload];
    if (!items.length || items.length > 500) throw new Error('Invalid batch size');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ธุรกรรมสต๊อก') || ss.insertSheet('ธุรกรรมสต๊อก');
    if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp','ผู้บันทึก','ร้าน/จุดจัดเก็บ','ประเภทรายการ','หมวดหมู่','รายการสินค้า','จำนวน','หน่วย','ราคารวม','หมายเหตุ','หมายเหตุแปลไทย','Transaction ID']);
    if (sheet.getLastColumn() < 12) sheet.getRange(1,12).setValue('Transaction ID');
    var existing = new Set();
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2,12,sheet.getLastRow()-1,1).getValues().forEach(function(r){if(r[0]) existing.add(String(r[0]));});
    }
    var seen = new Set();
    var rows = [];
    items.forEach(function(item) {
      if (!item.id || !item.item_name || !item.station || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 0) throw new Error('Invalid transaction');
      var id = String(item.id);
      if (existing.has(id) || seen.has(id)) return;
      seen.add(id);
      var date = item.timestamp ? new Date(item.timestamp) : new Date();
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      rows.push([
        Utilities.formatDate(date,'Asia/Bangkok','yyyy-MM-dd HH:mm:ss'),
        item.checked_by || '',item.station,item.action_type || 'เช็คสต็อก',
        item.category || '',item.item_name,Number(item.quantity),
        item.unit || '',item.price === undefined ? '' : item.price,
        item.note || '',item.translatedNote || '',id
      ]);
    });
    if (rows.length) sheet.getRange(sheet.getLastRow()+1,1,rows.length,12).setValues(rows);
    return json_({status:'success',count:items.length,inserted:rows.length});
  } catch (error) {
    return json_({status:'error',message:String(error)});
  } finally {
    lock.releaseLock();
  }
}
