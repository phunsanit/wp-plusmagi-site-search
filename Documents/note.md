tree -I 'node_modules|.git|.svn|.DS_Store|temp_build|playwright-report|test-results'

---------------------------------------------------------------------------------------------------

# Guest tests (ทั้ง 3 browser)
cd Playwright && npx playwright test

# Block tests (ต้องใส่ password admin)
cd Playwright && npx playwright test --project=setup
npx playwright test --project=admin

---------------------------------------------------------------------------------------------------

#
# Clone SVN repository (WordPress.org plugin)
cd SVN
svn checkout https://plugins.svn.wordpress.org/plusmagi-site-search
#
# หมายเหตุ: SVN จะสร้างโฟลเดอร์ .svn ให้อัตโนมัติ ไม่ต้องสร้างเอง
# ใช้ svn update, svn add, svn commit, svn status ได้ในโฟลเดอร์นี้

---------------------------------------------------------------------------------------------------

https://wordpress.org/plugins/developers/add/

---
## SVN Workflow Note

- การ pull (update) โค้ดจาก WordPress SVN repository:

```sh
cd /SVN
svn update
```

- คำสั่งนี้จะดึงการเปลี่ยนแปลงล่าสุดจากรีโมท SVN มายัง working copy ในเครื่อง
- ใช้ทุกครั้งก่อนเริ่มแก้ไขไฟล์หรือก่อน commit เพื่อป้องกัน conflict
---
---

Remove-Item -Force -Recurse wp-assets\plusmagi-site-search\plusmagi-site-search.zip

Compress-Archive -Path SVN\trunk\* -DestinationPath wp-assets\plusmagi-site-search\plusmagi-site-search.zip -Force