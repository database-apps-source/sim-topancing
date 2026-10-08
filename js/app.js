// SPA SIM-TOPANCING: semua halaman dirender lokal dari S.d (cache) => navigasi 0ms
const S={user:LS.g('u',null),token:LS.g('t',null),d:LS.g('d',null),page:'dashboard',cart:LS.g('cart',[]),cat:'',q:'',tab:'Supplier'};
const $=s=>document.querySelector(s),rp=n=>'Rp '+(+n||0).toLocaleString('id-ID'),
 esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pa=()=>['owner','admin'].includes(S.user.role),stokOf=k=>+(S.d.stok.find(x=>String(x.sku)===String(k))||{}).qty||0;
const NAV=[['dashboard','Dashboard','Operasional'],['pos','POS Kasir','Operasional','owner admin kasir'],['produk','Katalog Produk','Inventaris'],['stok','Stok & Koreksi','Inventaris'],
 ['po','Pesanan Pembelian','Pembelian & Gudang','owner admin gudang'],['kontak','Direktori Kontak','Pembelian & Gudang','owner admin'],
 ['kas','Kas & Beban','Keuangan','owner admin'],['laporan','Laporan Laba','Keuangan','owner admin'],['migrasi','Migrasi Data','Sistem','owner admin']];
function toast(m,t){const e=document.createElement('div');e.textContent=m;if(t)e.className=t;$('#toast').append(e);setTimeout(()=>e.remove(),3500)}
function modal(h){$('#mb').innerHTML=h;$('#modal').classList.remove('hide')}function closeM(){$('#modal').classList.add('hide')}
function tbl(cols,rows,empty='Belum ada data.'){return `<div class=tw><table><tr>${cols.map(c=>`<th class="${c.r?'r':''}">${c.h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${cols.map(c=>`<td class="${c.r?'r':''}">${c.f(r)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan=99 class=mut>${empty}</td></tr>`}</table></div>`}
function form(title,fields,vals,submit){
  modal(`<h3>${title}</h3><form id=f>${fields.map(f=>`<label>${f.l}${f.o?`<select name=${f.k}>${f.o.map(o=>`<option ${vals[f.k]==o?'selected':''}>${esc(o)}</option>`).join('')}</select>`:f.ta?`<textarea name=${f.k}>${esc(vals[f.k]??'')}</textarea>`:`<input name=${f.k} type=${f.t||'text'} step=any value="${esc(vals[f.k]??'')}" ${f.r?'required':''} ${f.ro?'readonly':''}>`}</label>`).join('')}<div class=row><button type=button class=btn data-a=close>Batal</button><button class="btn pri">Simpan</button></div></form>`);
  $('#f').onsubmit=e=>{e.preventDefault();submit(Object.fromEntries(new FormData(e.target)));closeM()};
}
const chip=p=>{const s=stokOf(p.sku),m=+p.min_stok;return s<=0?'<span class="chip no">HABIS</span>':s<=m?'<span class="chip lo">MENIPIS</span>':'<span class="chip ok">AMAN</span>'};
// ---------- halaman ----------
const V={
 dashboard(){const d=S.d,t=new Date().toISOString().slice(0,10),hr=d.jual.filter(x=>x.status==='COMPLETED'&&String(x.ts).slice(0,10)===t),
  low=d.produk.filter(p=>p.status==='Aktif'&&stokOf(p.sku)<=+p.min_stok),nilai=d.produk.reduce((a,p)=>a+stokOf(p.sku)*(+p.hpp||0),0),k=(l,v)=>`<div class="card kpi"><small>${l}</small><div>${v}</div></div>`;
  return `<div class="grid k4">${k('Omzet hari ini',rp(hr.reduce((a,x)=>a+ +x.total,0)))}${k('Transaksi',hr.length)}${k('SKU aktif',d.produk.filter(p=>p.status==='Aktif').length)}${k('Stok menipis',low.length)}${pa()?k('Nilai persediaan',rp(nilai)):''}</div>
  <div class="grid two" style="margin-top:16px"><div class=card><h3>Perlu restock</h3>${tbl([{h:'SKU',f:p=>esc(p.sku)},{h:'Produk',f:p=>esc(p.nama)},{h:'Stok',r:1,f:p=>stokOf(p.sku)},{h:'Min',r:1,f:p=>p.min_stok}],low.slice(0,8),'Semua stok aman ✓')}</div>
  <div class=card><h3>Transaksi terakhir</h3>${tbl([{h:'Invoice',f:x=>esc(x.inv)},{h:'Kasir',f:x=>esc(x.kasir)},{h:'Total',r:1,f:x=>rp(x.total)}],d.jual.slice(-8).reverse())}</div></div>`},
 pos(){const c=[...new Set(S.d.produk.map(p=>p.kategori).filter(Boolean))];
  return `<div class=pos><aside class="card cats"><button class="btn ${S.cat?'':'on'}" data-a=cat data-v="">Semua</button>${c.map(x=>`<button class="btn ${S.cat===x?'on':''}" data-a=cat data-v="${esc(x)}">${esc(x)}</button>`).join('')}</aside>
  <section><input id=q placeholder="Scan barcode / cari nama, SKU… (Enter)" value="${esc(S.q)}" autofocus><div class=pg id=grid></div></section>
  <aside class="card cart"><h3>Keranjang</h3><div id=ci></div><label>Diskon (Rp)<input id=dk type=number min=0 value=0></label>
  <label>Metode<select id=mt><option>Tunai</option><option>Transfer</option><option>QRIS</option></select></label><label>Dibayar (Rp)<input id=by type=number min=0></label>
  <div class=tot><span>TOTAL</span><span id=gt>Rp 0</span></div><div class=mut id=kb></div><button class="btn pri" id=pay data-a=bayar style="margin-top:8px">[F8] BAYAR & CETAK STRUK</button></aside></div>`},
 produk(){return `<div class=bar><input id=q placeholder="Cari SKU, nama, barcode…" value="${esc(S.q)}"><button class="btn pri" data-a=ep data-k="">+ Tambah Produk</button></div><div class=card id=pl></div>`},
 stok(){const K=S.d.koreksi.filter(k=>k.status==='MENUNGGU');
  return `<div class=bar><input id=q placeholder="Cari SKU / nama…" value="${esc(S.q)}"></div><div class=card id=sl></div><div class=card style="margin-top:16px"><h3>Koreksi menunggu persetujuan (${K.length})</h3>${tbl([{h:'No',f:k=>esc(k.no)},{h:'SKU',f:k=>esc(k.sku)},{h:'Sistem',r:1,f:k=>k.sistem},{h:'Fisik',r:1,f:k=>k.fisik},{h:'Selisih',r:1,f:k=>k.selisih},{h:'Alasan',f:k=>esc(k.alasan)},{h:'',f:k=>pa()?`<button class="btn sm pri" data-a=acc data-k="${esc(k.no)}">Setujui</button>`:''}],K,'Tidak ada.')}</div>`},
 po(){return `<div class=bar><button class="btn pri" data-a=npo>+ Buat PO</button></div><div class=card>${tbl([{h:'No PO',f:p=>esc(p.no)},{h:'Tanggal',f:p=>esc(String(p.tgl).slice(0,10))},{h:'Supplier',f:p=>esc(p.supplier)},{h:'Total',r:1,f:p=>rp(p.total)},{h:'Status',f:p=>`<span class="chip lo">${esc(p.status)}</span>`},{h:'',f:p=>['ORDERED','PARTIALLY_RECEIVED'].includes(p.status)?`<button class="btn sm acc" data-a=rcv data-k="${esc(p.no)}">Terima Barang</button>`:''}],S.d.po.slice().reverse())}</div>`},
 kontak(){const l=S.d.kontak.filter(k=>k.tipe===S.tab);
  return `<div class=bar><button class="btn ${S.tab==='Supplier'?'pri':''}" data-a=tab data-v=Supplier>Pemasok</button><button class="btn ${S.tab==='Pelanggan'?'pri':''}" data-a=tab data-v=Pelanggan>Pelanggan</button><span style="flex:1"></span><button class="btn pri" data-a=ek data-k="">+ Tambah Kontak</button></div><div class=card>${tbl([{h:'Nama',f:k=>esc(k.nama)},{h:'PIC',f:k=>esc(k.pic)},{h:'WA',f:k=>esc(k.wa)},{h:'Kategori',f:k=>esc(k.kategori)},{h:'Tempo',f:k=>esc(k.tempo)},{h:'',f:k=>`<button class="btn sm" data-a=ek data-k="${esc(k.id)}">Ubah</button>`}],l)}</div>`},
 kas(){const m=S.d.kas.reduce((a,k)=>a+ +k.masuk,0),o=S.d.kas.reduce((a,k)=>a+ +k.keluar,0);
  return `<div class="grid k4"><div class="card kpi"><small>Kas masuk</small><div style="color:var(--ok)">${rp(m)}</div></div><div class="card kpi"><small>Pengeluaran / beban</small><div style="color:var(--dn)">${rp(o)}</div></div><div class="card kpi"><small>Selisih</small><div>${rp(m-o)}</div></div></div>
  <div class=bar style="margin-top:16px"><button class="btn pri" data-a=nk>+ Catat Kas / Beban</button></div><div class=card>${tbl([{h:'Waktu',f:k=>esc(String(k.ts).slice(0,16).replace('T',' '))},{h:'Kategori',f:k=>esc(k.kategori)},{h:'Keterangan',f:k=>esc(k.ket)},{h:'Masuk',r:1,f:k=>k.masuk?rp(k.masuk):'-'},{h:'Keluar',r:1,f:k=>k.keluar?rp(k.keluar):'-'}],S.d.kas.slice().reverse())}</div>`},
 laporan(){const n=new Date(),a=new Date(n.getFullYear(),n.getMonth(),1).toISOString().slice(0,10);
  return `<div class=bar><input type=date id=ld value="${a}"><input type=date id=ls value="${n.toISOString().slice(0,10)}"><button class="btn pri" data-a=lap>Tampilkan</button></div><div id=lr class=mut>Pilih periode lalu klik Tampilkan.</div>`},
 migrasi(){return `<div class=card><h3>Migrasi Data Produk (CSV)</h3><p class=mut>Tempel CSV. Kolom: sku,barcode,nama,kategori,merek,satuan,hpp,harga,harga_grosir,min_stok,supplier,stok_awal. SKU yang sudah ada diperbarui; SKU baru dibuat dengan saldo awal (OPENING_BALANCE).</p>
  <textarea id=csv placeholder="sku,barcode,nama,..."></textarea><div class=row style="justify-content:flex-start;flex-wrap:wrap"><button class=btn data-a=tpl>Unduh Template</button><button class=btn data-a=imp data-v=1>Validasi</button><button class="btn pri" data-a=imp data-v=0>Impor</button><button class=btn data-a=bak>Backup JSON (lokal)</button></div><div id=ir style="margin-top:12px"></div></div>`}
};
function posGrid(){const q=S.q.toLowerCase(),l=S.d.produk.filter(p=>p.status==='Aktif'&&(!S.cat||p.kategori===S.cat)&&(!q||(p.nama+p.sku+p.barcode).toLowerCase().includes(q))).slice(0,60);
  $('#grid').innerHTML=l.map(p=>`<div class="card pt ${stokOf(p.sku)<=0?'z':''}" data-a=add data-k="${esc(p.sku)}"><b>${esc(p.nama)}</b><small class=mut>${esc(p.sku)} · Stok ${stokOf(p.sku)}</small><div class=pr>${rp(p.harga)}</div></div>`).join('')||'<p class=mut>Produk tidak ditemukan.</p>'}
function posCart(){LS.s('cart',S.cart);$('#ci').innerHTML=S.cart.map(i=>`<div class=ci><span>${esc(i.nama)}<br><small class=mut>${rp(i.harga)}</small></span><button class=btn data-a=dec data-k="${esc(i.sku)}">−</button><b>${i.qty}</b><button class=btn data-a=add data-k="${esc(i.sku)}">+</button><button class="btn dn" data-a=del data-k="${esc(i.sku)}">×</button></div>`).join('')||'<p class=mut>Kosong. Scan / pilih produk.</p>';posTot()}
const sub=()=>S.cart.reduce((a,i)=>a+i.qty*i.harga,0),gt=()=>Math.max(0,sub()-(+$('#dk').value||0));
function posTot(){const t=gt();$('#gt').textContent=rp(t);const b=+$('#by').value||0,tn=$('#mt').value==='Tunai';$('#kb').textContent=tn&&b?(b>=t?'Kembali: '+rp(b-t):'Kurang: '+rp(t-b)):'';$('#pay').textContent='[F8] BAYAR & CETAK STRUK - '+rp(t);$('#pay').disabled=!S.cart.length}
function addCart(k){const p=S.d.produk.find(x=>String(x.sku)===String(k));if(!p)return;const i=S.cart.find(x=>x.sku===p.sku);if((i?i.qty:0)+1>stokOf(p.sku))return toast('Stok tidak cukup','err');i?i.qty++:S.cart.push({sku:p.sku,nama:p.nama,harga:+p.harga,qty:1});posCart()}
function receipt(inv,items,sb,dk,t,by,mt){const w=40,L=(a,b)=>a+(' '.repeat(Math.max(1,w-a.length-b.length)))+b,n=x=>(+x).toLocaleString('id-ID'),ln='-'.repeat(w),d=new Date().toLocaleString('id-ID');
  return ['SIM-TOPANCING','No: '+inv,d,'Kasir: '+S.user.nama,ln,...items.map(i=>L(i.nama.slice(0,22),i.qty+'x'+n(i.harga)+' '+n(i.qty*i.harga))),ln,L('Subtotal',n(sb)),L('Diskon',n(dk)),L('TOTAL',n(t)),L(mt,n(by)),L('Kembali',n(by-t)),ln,'Terima kasih!'].join('\n')}
function bayar(){if(!S.cart.length)return;const dk=+$('#dk').value||0,t=gt(),mt=$('#mt').value,by=mt==='Tunai'?(+$('#by').value||0):t;
  if(by<t)return toast('Pembayaran kurang dari total','err');if(S.user.role==='kasir'&&dk>50000)return toast('Diskon melebihi batas kasir (Rp 50.000)','err');
  const items=S.cart.map(i=>({...i})),sb=sub(),inv='INV-LOKAL-'+Date.now().toString().slice(-6);
  items.forEach(i=>{const s=S.d.stok.find(x=>String(x.sku)===String(i.sku));if(s)s.qty=+s.qty-i.qty});S.d.jual.push({inv,ts:new Date().toISOString(),kasir:S.user.nama,total:t,status:'COMPLETED'});
  S.cart=[];LS.s('d',S.d);const r=receipt(inv,items,sb,dk,t,by,mt);
  enqueue('checkout',{items:items.map(i=>({sku:i.sku,qty:i.qty})),diskon:dk,metode:mt,bayar:by,idem:uid()},'Checkout');
  modal(`<h3>✅ Transaksi tersimpan</h3><div class=rc>${esc(r)}</div><p class=mut>Nomor resmi diterbitkan server saat sinkron.</p><div class=row><button class=btn data-a=close>Tutup</button><button class="btn pri" onclick="print()">Cetak</button></div>`);render()}
function lists(){const q=S.q.toLowerCase(),m=p=>!q||(p.nama+p.sku+p.barcode).toLowerCase().includes(q),P=S.d.produk.filter(m).slice(0,100);
  if($('#pl'))$('#pl').innerHTML=tbl([{h:'SKU',f:p=>esc(p.sku)},{h:'Produk',f:p=>esc(p.nama)},{h:'Kategori',f:p=>esc(p.kategori)},{h:'Merek',f:p=>esc(p.merek)},{h:'Stok',r:1,f:p=>stokOf(p.sku)+' '+esc(p.satuan)},...(pa()?[{h:'HPP',r:1,f:p=>rp(p.hpp)}]:[]),{h:'Harga',r:1,f:p=>rp(p.harga)},{h:'Status',f:p=>esc(p.status)},...(pa()?[{h:'',f:p=>`<button class="btn sm" data-a=ep data-k="${esc(p.sku)}">Ubah</button>`}]:[])],P);
  if($('#sl'))$('#sl').innerHTML=tbl([{h:'SKU',f:p=>esc(p.sku)},{h:'Produk',f:p=>esc(p.nama)},{h:'Stok',r:1,f:p=>stokOf(p.sku)},{h:'Min',r:1,f:p=>p.min_stok},{h:'Status',f:chip},{h:'',f:p=>`<button class="btn sm" data-a=kor data-k="${esc(p.sku)}">Koreksi</button><button class="btn sm" data-a=krt data-k="${esc(p.sku)}">Kartu</button>`}],P)}
// ---------- aksi ----------
const A={close:closeM,menu:()=>$('#side').classList.toggle('open'),logout:()=>logout(),
 go(x){go(x.v)},cat(x){S.cat=x.v;render()},tab(x){S.tab=x.v;render()},add:x=>addCart(x.k),
 dec(x){const i=S.cart.find(c=>c.sku===x.k);if(i&&--i.qty<=0)S.cart=S.cart.filter(c=>c!==i);posCart()},del(x){S.cart=S.cart.filter(c=>c.sku!==x.k);posCart()},bayar,
 ep(x){const e=S.d.produk.find(p=>String(p.sku)===x.k),n=!e;form(n?'Tambah Produk':'Ubah Produk',[{k:'sku',l:'SKU',r:1,ro:!n},{k:'barcode',l:'Barcode'},{k:'nama',l:'Nama',r:1},{k:'kategori',l:'Kategori'},{k:'merek',l:'Merek'},{k:'satuan',l:'Satuan'},...(pa()?[{k:'hpp',l:'HPP',t:'number'}]:[]),{k:'harga',l:'Harga jual',t:'number',r:1},{k:'harga_grosir',l:'Harga grosir',t:'number'},{k:'min_stok',l:'Stok minimum',t:'number'},...(n?[{k:'stok_awal',l:'Stok awal',t:'number'}]:[]),{k:'status',l:'Status',o:['Aktif','Nonaktif','Arsip']}],e||{satuan:'Pcs',status:'Aktif'},o=>{
  if(['harga','hpp','harga_grosir','min_stok','stok_awal'].some(k=>+o[k]<0))return toast('Nilai tidak boleh negatif','err');
  if(n&&S.d.produk.some(p=>String(p.sku)===o.sku))return toast('SKU sudah ada','err');
  if(n){S.d.produk.push(o);S.d.stok.push({sku:o.sku,qty:+o.stok_awal||0})}else Object.assign(e,o);o._baru=n;LS.s('d',S.d);enqueue('saveProduk',o,'Simpan produk');render();toast('Tersimpan')})},
 kor(x){form('Ajukan Koreksi — '+x.k,[{k:'fisik',l:'Stok fisik (hasil hitung)',t:'number',r:1},{k:'alasan',l:'Alasan',o:['Selisih hitung fisik','Barang rusak','Barang hilang','Lainnya']},{k:'catatan',l:'Catatan',r:1}],{},o=>{enqueue('ajukanKoreksi',{...o,sku:x.k},'Koreksi');toast('Diajukan, menunggu persetujuan')})},
 async krt(x){const r=await call('kartu',{sku:x.k});modal(`<h3>Kartu Stok ${esc(x.k)}</h3>${tbl([{h:'Waktu',f:m=>esc(String(m.ts).slice(5,16).replace('T',' '))},{h:'Tipe',f:m=>esc(m.tipe)},{h:'Qty',r:1,f:m=>m.qty},{h:'Ref',f:m=>esc(m.ref)}],r.data||[])}<div class=row><button class=btn data-a=close>Tutup</button></div>`)},
 acc(x){enqueue('setujuKoreksi',{no:x.k},'Setujui koreksi');const k=S.d.koreksi.find(c=>c.no===x.k);if(k)k.status='DISETUJUI';render()},
 ek(x){const e=S.d.kontak.find(k=>k.id===x.k);form(e?'Ubah Kontak':'Tambah Kontak',[{k:'nama',l:'Nama',r:1},{k:'pic',l:'PIC'},{k:'wa',l:'WhatsApp'},{k:'alamat',l:'Alamat'},{k:'kategori',l:'Kategori'},{k:'tempo',l:'Syarat tempo'}],e||{},o=>{o.tipe=e?e.tipe:S.tab;if(e)o.id=e.id;else o.id='K'+Date.now();e?Object.assign(e,o):S.d.kontak.push({...o,status:'Aktif'});enqueue('saveKontak',o,'Kontak');render()})},
 nk(){form('Catat Kas / Beban',[{k:'jenis',l:'Jenis',o:['KELUAR','MASUK']},{k:'kategori',l:'Kategori',r:1},{k:'jumlah',l:'Jumlah (Rp)',t:'number',r:1},{k:'ket',l:'Keterangan',r:1}],{},o=>{if(!(+o.jumlah>0))return toast('Jumlah harus > 0','err');S.d.kas.push({ts:new Date().toISOString(),jenis:o.jenis,kategori:o.kategori,ket:o.ket,masuk:o.jenis==='MASUK'?+o.jumlah:'',keluar:o.jenis==='KELUAR'?+o.jumlah:''});enqueue('saveKas',o,'Kas');render()})},
 npo(){const sp=S.d.kontak.filter(k=>k.tipe==='Supplier').map(k=>k.nama);if(!sp.length)return toast('Tambah supplier dulu di Direktori Kontak','err');
  form('Buat PO',[{k:'supplier',l:'Supplier',o:sp},{k:'ongkir',l:'Ongkir',t:'number'},{k:'items',l:'Item (SKU,qty,harga beli per baris)',ta:1}],{},o=>{const it=o.items.split('\n').map(l=>l.trim().split(',')).filter(a=>a[0]).map(a=>({sku:a[0].trim(),qty:+a[1],harga:+a[2],nama:(S.d.produk.find(p=>String(p.sku)===a[0].trim())||{}).nama||''}));
   if(!it.length||it.some(i=>!i.nama||!(i.qty>0)||!(i.harga>=0)))return toast('Item tidak valid (cek SKU/qty/harga)','err');enqueue('savePO',{supplier:o.supplier,ongkir:o.ongkir,items:it,status:'ORDERED'},'PO');toast('PO dikirim ke antrean')})},
 rcv(x){const po=S.d.po.find(p=>p.no===x.k),its=JSON.parse(po.items),got=JSON.parse(po.diterima||'{}'),f=[];its.forEach(i=>{const s=i.qty-(got[i.sku]||0);if(s>0)f.push({k:'b_'+i.sku,l:`${i.nama} — baik (sisa ${s})`,t:'number'},{k:'r_'+i.sku,l:'rusak (karantina)',t:'number'})});
  form('Terima Barang '+x.k,f,{},o=>{enqueue('terimaPO',{no:x.k,items:its.map(i=>({sku:i.sku,baik:+o['b_'+i.sku]||0,rusak:+o['r_'+i.sku]||0}))},'Penerimaan');toast('Penerimaan diposting ke antrean')})},
 async lap(){$('#lr').textContent='Memuat…';const r=await call('laporan',{dari:$('#ld').value,sampai:$('#ls').value});if(!r.success)return toast(r.message,'err');const d=r.data,k=(l,v)=>`<div class="card kpi"><small>${l}</small><div>${v}</div></div>`;
  $('#lr').innerHTML=`<div class="grid k4">${k('Penjualan neto',rp(d.neto))}${k('HPP',rp(d.hpp))}${k('Laba kotor',`<span style="color:var(--ok)">${rp(d.laba)}</span>`)}${k('Margin',d.margin+'%')}</div><div class=card style="margin-top:16px">${tbl([{h:'Kategori',f:c=>esc(c.k)},{h:'Omzet',r:1,f:c=>rp(c.omzet)},{h:'HPP',r:1,f:c=>rp(c.hpp)},{h:'Laba',r:1,f:c=>rp(c.omzet-c.hpp)}],d.kategori)}<p class=mut>${d.trx} transaksi · diskon ${rp(d.diskon)} · HPP dari snapshot saat transaksi.</p></div>`},
 tpl(){dl('template-produk.csv','sku,barcode,nama,kategori,merek,satuan,hpp,harga,harga_grosir,min_stok,supplier,stok_awal\nRN-J-01,899214400192,Relix Sisik 602,Joran,Relix,Batang,118000,175000,160000,5,PT Sumber Aneka,10\n')},
 async imp(x){const rows=csv($('#csv').value);if(!rows.length)return toast('CSV kosong','err');$('#ir').textContent='Memproses…';const r=await call('importProduk',{rows,dry:x.v==='1'});if(!r.success)return toast(r.message,'err');const d=r.data;
  $('#ir').innerHTML=`<b>${d.valid} baris valid</b>${x.v==='0'?` · ${d.diimpor} diimpor`:''}${d.errors.length?'<br>'+d.errors.map(e=>`<span class="chip no">Baris ${e.baris}: ${esc(e.pesan)}</span>`).join(' '):''}`;if(x.v==='0'){toast('Impor selesai');boot(true)}},
 bak(){dl('backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(S.d,null,1))}};
function dl(n,t){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t]));a.download=n;a.click()}
function csv(t){const L=t.trim().split(/\r?\n/);if(L.length<2)return[];const sp=l=>(l.match(/("([^"]|"")*"|[^,]*)(,|$)/g)||[]).map(c=>c.replace(/,$/,'').replace(/^"|"$/g,'').replace(/""/g,'"').trim()),h=sp(L[0]);
  return L.slice(1).filter(l=>l.trim()).map(l=>{const c=sp(l),o={};h.forEach((k,i)=>o[k]=c[i]);return o})}
// ---------- shell ----------
function go(p){S.page=p;S.q='';$('#side').classList.remove('open');render()}
function render(){if(!S.user||!S.d)return;const ok=NAV.filter(n=>!n[3]||n[3].split(' ').includes(S.user.role));let g='',h='';
  ok.forEach(n=>{if(n[2]!==g){g=n[2];h+=`<h6>${g.toUpperCase()}</h6>`}h+=`<a class="${S.page===n[0]?'on':''}" data-a=go data-v=${n[0]}>${n[1]}</a>`});$('#nav').innerHTML=h;
  if(!ok.some(n=>n[0]===S.page))S.page='dashboard';$('#ttl').textContent=(ok.find(n=>n[0]===S.page)||[])[1];$('#un').textContent=S.user.nama;$('#ur').textContent=S.user.role;
  const ae=document.activeElement&&document.activeElement.id;$('#view').innerHTML=V[S.page]();
  if(S.page==='pos'){posGrid();posCart()}lists();if(ae&&$('#'+ae)&&$('#'+ae).tagName==='INPUT')$('#'+ae).focus()}
function showApp(){$('#login').classList.add('hide');$('#app').classList.remove('hide');render();setSync()}
function logout(){['u','t','d','q','cart'].forEach(k=>localStorage.removeItem(k));location.reload()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&A[t.dataset.a])A[t.dataset.a](t.dataset,t)});
document.addEventListener('input',e=>{const i=e.target.id;if(i==='q'){S.q=e.target.value;S.page==='pos'?posGrid():lists()}else if(['dk','by','mt'].includes(i))posTot()});
document.addEventListener('keydown',e=>{if(e.key==='F8'&&S.page==='pos'){e.preventDefault();bayar()}if(e.key==='F1'&&S.user&&NAV[1]){e.preventDefault();go('pos')}
  if(e.key==='Enter'&&e.target.id==='q'&&S.page==='pos'){const v=e.target.value.trim(),p=S.d.produk.find(x=>String(x.barcode)===v||String(x.sku).toLowerCase()===v.toLowerCase());if(p){addCart(p.sku);e.target.value='';S.q='';posGrid()}}});
$('#lf').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;b.textContent='Masuk…';
  try{const r=await call('login',Object.fromEntries(new FormData(e.target)));if(!r.success)throw new Error(r.message);S.token=r.data.token;S.user=r.data.user;LS.s('t',S.token);LS.s('u',S.user);S.d=null;await boot();showApp()}
  catch(x){toast(x.message,'err')}b.disabled=false;b.textContent='Masuk'};
if(S.user&&S.token){if(S.d)showApp();boot(true).then(()=>{if(!S.d)logout();else showApp()});flush()}else $('#login').classList.remove('hide');
