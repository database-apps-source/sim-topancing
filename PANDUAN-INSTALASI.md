# Panduan Instalasi SIM-TOPANCING

## A. Backend (Google Apps Script)
1. Buka https://script.google.com → **Proyek Baru** → rename `Code.gs` jadi `Kode`, tempel seluruh isi `Kode.gs`.
2. Pilih fungsi **setupAppEnvironment** → ▶ Run → izinkan akses Drive & Sheets. **Jalankan HANYA SEKALI.** Cek log ✅ dan folder "📁 SIM-TOPANCING" di Drive.
3. Login awal: `owner@topancing.com` / PIN `123456`. Tambah pengguna: jalankan di editor `tambahUser('Dewi','dewi@x.com','kasir','654321')` (role: owner/admin/kasir/gudang). Untuk ganti PIN owner, panggil `tambahUser('Owner','owner@topancing.com','owner','PIN_BARU')`.
4. **Deploy → New deployment → Web app** → Execute as **Me**, access **Anyone** → Deploy → salin URL `/exec`.
5. Setiap mengubah kode: Deploy → Manage deployments → Edit → New version.
6. **Migrasi skema** (jika ada kolom/sheet baru di versi berikutnya): jalankan `migrateSchema()` — aman diulang, tidak menghapus data.

## B. Frontend → GitHub Pages
Folder kerja = folder hasil ekstrak ZIP bernama **`sim-topancing`** (isinya langsung `index.html`, `css/`, `js/`). Di folder inilah `git init` dijalankan.
1. Buka `js/config.js`, ganti URL dengan URL `/exec` dari langkah A4.
2. Install Git (https://git-scm.com), buka PowerShell/Terminal, lalu:
```bash
cd C:\path\ke\sim-topancing
dir
```
Pastikan `index.html` tampil di daftar. Kalau tidak, Anda di folder yang salah.
3. Buat repository **Public** kosong di github.com (tanpa README). Lalu:
```bash
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/sim-topancing.git
git push -u origin main
```
Saat diminta password, pakai **Personal Access Token** (GitHub → Settings → Developer settings → Tokens, scope `repo`). Mengetik token tidak menampilkan karakter — itu normal.
4. Repo → Settings → Pages → Branch `main`, folder `/ (root)` → Save. Situs: `https://USERNAME.github.io/sim-topancing/` (tunggu 1–2 menit).
5. Update berikutnya: `git add .` → `git commit -m "update"` → `git push`. Gunakan Ctrl+Shift+R jika tampilan lama.

## C. Migrasi data lama
Menu **Migrasi Data** → Unduh Template → isi CSV (sku, nama, harga, stok_awal, dst.) → tempel → **Validasi** → **Impor**. SKU baru otomatis mendapat mutasi OPENING_BALANCE.

## D. Uji cepat
Login → tambah produk → POS: scan/cari → Bayar (stok berkurang instan, struk muncul) → cek sheet `Penjualan`, `Mutasi`. Matikan internet lalu transaksi: status "Offline (n antre)", otomatis terkirim saat online (idempoten, tidak ganda).
