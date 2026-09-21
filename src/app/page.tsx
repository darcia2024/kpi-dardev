import Link from "next/link";
import Image from "next/image";
import { LandingMotion } from "@/components/public/landing-motion";
import "./landing.css";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBook2,
  IconEye,
  IconScale,
  IconSchool,
  IconShieldCheck
} from "@tabler/icons-react";

export default function HomePage(): React.JSX.Element {
  return (
    <div className="landing-page kpi-editorial dexina-style">
      <LandingMotion />

      {/* =========================================================================
          DEXINA HERO SECTION
          ========================================================================= */}
      <section className="dexina-hero" aria-labelledby="page-title">
        <div className="dexina-hero__inner">
          
          {/* Eyebrow Pill */}
          <div className="dexina-eyebrow">
            <span className="dexina-eyebrow__dot">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </span>
            <span className="dexina-eyebrow__text">BADAN SEMI OTONOM PPMI MESIR</span>
          </div>

          {/* 2-Column Asymmetric Grid */}
          <div className="dexina-hero__grid">
            
            {/* Left Column: Massive Headline */}
            <div className="dexina-hero__left">
              <h1 id="page-title" className="dexina-hero__h1">
                Menjaga interaksi<br />
                melalui edukasi &amp;<br />
                penelaahan adil
              </h1>
            </div>

            {/* Right Column: Top Micro-note & Bottom Editorial Actions */}
            <div className="dexina-hero__right">
              
              {/* Top Micro-note with Big Arrow */}
              <div className="dexina-hero__note">
                <span className="dexina-hero__note-arrow" aria-hidden="true">&#x2197;</span>
                <p>
                  Kanal aspirasi &amp; telaah informasi aktif. Memiliki situasi atau masukan yang perlu disampaikan? Tuliskan melalui kanal resmi.
                </p>
              </div>

              {/* Bottom Paragraph & Action Buttons */}
              <div className="dexina-hero__action-block">
                <p className="dexina-hero__lead">
                  KPI hadir sebagai ruang edukasi, pencegahan, dan penelaahan objektif demi menjaga norma, etika, serta martabat seluruh mahasiswa dan pelajar Indonesia di Mesir.
                </p>
                <div className="dexina-hero__buttons">
                  <Link className="dexina-btn-red" href="/publik/aspirasi">
                    <span>Sampaikan aspirasi</span>
                    <IconArrowRight aria-hidden="true" size={17} stroke={2.2} />
                  </Link>
                  <Link className="dexina-btn-outline" href="/#tentang">
                    <span>Kenali KPI</span>
                    <IconArrowRight aria-hidden="true" size={17} stroke={2.2} />
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* Full-width High-Impact Photographic Banner */}
          <div className="dexina-hero__media">
            <Image
              src="/images/hero-discussion.jpg"
              alt="Warga Masisir berdiskusi dan mengkaji materi akademik di perpustakaan Kairo"
              width={1360}
              height={765}
              priority
              className="dexina-hero__img"
            />
            <div className="dexina-hero__media-badge">
              <span className="dexina-hero__media-dot" />
              <span>Komisi Peduli Interaksi &bull; PPMI Mesir Periode 2026&ndash;2027</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION: TENTANG KPI & MANIFESTO
          ========================================================================= */}
      <section id="tentang" className="dexina-section dexina-manifesto" aria-labelledby="manifesto-title">
        <div className="dexina-section__container">
          <div className="dexina-pill-label">TENTANG KPI</div>
          <div className="dexina-manifesto__grid">
            <h2 id="manifesto-title" className="dexina-manifesto__h2">
              Menjaga interaksi Masisir tetap sehat, beradab, dan bertanggung jawab.
            </h2>
            <p className="dexina-manifesto__desc">
              KPI adalah Badan Semi Otonom PPMI Mesir yang bergerak dalam bidang interaksi, sosial, norma, dan etika mahasiswa serta pelajar Indonesia di Mesir dengan penelaahan independen dan berkeadilan.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: MANDAT & RUANG KERJA (3 CARDS)
          ========================================================================= */}
      <section className="dexina-section" aria-labelledby="focus-title">
        <div className="dexina-section__container">
          <div className="dexina-section__head">
            <div className="dexina-pill-label">MANDAT KPI</div>
            <h2 id="focus-title" className="dexina-section__title">
              Ruang kerja yang dekat dengan kehidupan Masisir.
            </h2>
            <p className="dexina-section__sub">
              KPI hadir untuk membangun pemahaman, membuka ruang dialog, dan memastikan setiap informasi ditangani dengan proses yang adil.
            </p>
          </div>

          <div className="dexina-cards-grid3">
            <article className="dexina-card">
              <div className="dexina-card__icon-wrap">
                <IconSchool size={24} stroke={1.8} />
              </div>
              <span className="dexina-card__num">01</span>
              <h3 className="dexina-card__title">Edukasi interaksi</h3>
              <p className="dexina-card__p">
                Materi, diskusi, dan forum yang membantu kita memahami norma, etika, dan cara berinteraksi dengan sehat.
              </p>
            </article>

            <article className="dexina-card dexina-card--featured">
              <div className="dexina-card__icon-wrap">
                <IconScale size={24} stroke={1.8} />
              </div>
              <span className="dexina-card__num">02</span>
              <h3 className="dexina-card__title">Penanganan objektif</h3>
              <p className="dexina-card__p">
                Setiap informasi ditelaah secara proporsional, berdasarkan prosedur, kewenangan, dan konteks yang cukup.
              </p>
            </article>

            <article className="dexina-card">
              <div className="dexina-card__icon-wrap">
                <IconShieldCheck size={24} stroke={1.8} />
              </div>
              <span className="dexina-card__num">03</span>
              <h3 className="dexina-card__title">Perlindungan pihak terkait</h3>
              <p className="dexina-card__p">
                Martabat, hak, privasi, keamanan, dan kerahasiaan menjadi bagian dari setiap proses KPI.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: BENTO DISCOVERY GRID (4 CARDS)
          ========================================================================= */}
      <section className="dexina-section" aria-labelledby="catalog-title">
        <div className="dexina-section__container">
          <div className="dexina-section__head">
            <div className="dexina-pill-label">JELAJAHI SITUS</div>
            <h2 id="catalog-title" className="dexina-section__title">
              Temukan informasi sesuai kebutuhan Anda.
            </h2>
          </div>

          <div className="dexina-bento-grid">
            
            <Link className="dexina-bento-card dexina-bento-card--dark" href="/publik">
              <div className="dexina-bento-card__num">01 &bull; PROFIL</div>
              <h3 className="dexina-bento-card__title">Mengenal KPI &amp; PPMI Mesir</h3>
              <p className="dexina-bento-card__desc">
                Kenali kedudukan, mandat, dan prinsip KPI dalam menjaga kualitas interaksi Masisir.
              </p>
              <span className="dexina-bento-card__action">Lihat profil organisasi &rarr;</span>
            </Link>

            <Link className="dexina-bento-card" href="/publik/publikasi">
              <div className="dexina-bento-card__num">02 &bull; KAJIAN</div>
              <h3 className="dexina-bento-card__title">Edukasi &amp; pencegahan</h3>
              <p className="dexina-bento-card__desc">
                Temukan diskusi, seminar, kajian, dan kegiatan yang membangun kesadaran interaksi.
              </p>
              <span className="dexina-bento-card__action">Buka publikasi &rarr;</span>
            </Link>

            <Link className="dexina-bento-card" href="/publik/aspirasi">
              <div className="dexina-bento-card__num">03 &bull; ASPIRASI</div>
              <h3 className="dexina-bento-card__title">Laporan &amp; pengaduan</h3>
              <p className="dexina-bento-card__desc">
                Sampaikan informasi melalui kanal resmi untuk ditelaah sesuai mandat dan kewenangan.
              </p>
              <span className="dexina-bento-card__action">Buka kanal aspirasi &rarr;</span>
            </Link>

            <div className="dexina-bento-card dexina-bento-card--subtle">
              <div className="dexina-bento-card__num">04 &bull; TATA KELOLA</div>
              <h3 className="dexina-bento-card__title">Objektif &amp; terlindungi</h3>
              <p className="dexina-bento-card__desc">
                Setiap proses memperhatikan objektivitas, proporsionalitas, martabat, privasi, dan kerahasiaan.
              </p>
              <span className="dexina-bento-card__action">Prinsip kerja KPI &rarr;</span>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: PENCEGAHAN & EDUKASI (2 CARDS)
          ========================================================================= */}
      <section id="pencegahan" className="dexina-section" aria-labelledby="updates-title">
        <div className="dexina-section__container">
          <div className="dexina-section__head">
            <div className="dexina-pill-label">PENCEGAHAN &amp; EDUKASI</div>
            <h2 id="updates-title" className="dexina-section__title">
              Interaksi yang sehat dimulai dari pemahaman.
            </h2>
          </div>

          <div className="dexina-grid2">
            <article className="dexina-highlight-card dexina-highlight-card--tint">
              <span className="dexina-highlight-card__badge">Pendidikan interaksi</span>
              <h3 className="dexina-highlight-card__title">Belajar bersama. Saling menghormati.</h3>
              <p className="dexina-highlight-card__desc">
                Pedoman KPI menempatkan pendidikan interaksi sebagai bagian dari pencegahan. Bentuknya dapat berupa diskusi, seminar, pelatihan, lokakarya, dan forum untuk memperkuat pemahaman norma serta etika.
              </p>
              <Link className="dexina-text-link" href="/publik/publikasi">
                Buka publikasi &rarr;
              </Link>
            </article>

            <article className="dexina-highlight-card">
              <span className="dexina-highlight-card__badge">Kerja sama kelembagaan</span>
              <h3 className="dexina-highlight-card__title">Kepedulian tumbuh lewat kebersamaan.</h3>
              <p className="dexina-highlight-card__desc">
                KPI berkoordinasi dengan PPMI Mesir, organisasi kekeluargaan, WIHDAH, dan lembaga terkait sesuai kebutuhan serta kewenangan masing-masing untuk menjaga keharmonisan warga.
              </p>
              <Link className="dexina-text-link" href="/publik">
                Kenali mitra KPI &rarr;
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: ALUR PROSEDUR 4 TAHAP
          ========================================================================= */}
      <section id="prosedur" className="dexina-section" aria-labelledby="process-title">
        <div className="dexina-section__container">
          <div className="dexina-process-box">
            
            <div className="dexina-process-left">
              <div className="dexina-pill-label">MEKANISME KERJA</div>
              <h2 id="process-title" className="dexina-section__title">
                Mendengar dengan saksama. Menelaah dengan adil.
              </h2>
              <p className="dexina-section__sub">
                Ringkasan prinsip penerimaan informasi dalam pedoman KPI. Laporan yang diterima belum berarti suatu pelanggaran terbukti, melainkan diproses secara objektif dan berimbang.
              </p>
            </div>

            <div className="dexina-process-right">
              <ol className="dexina-process-list">
                <li>
                  <span className="dexina-step-num">01</span>
                  <div>
                    <h4>Penerimaan informasi</h4>
                    <p>Informasi dapat berasal dari laporan, pengaduan, organisasi, maupun pengamatan lapangan secara terstruktur.</p>
                  </div>
                </li>
                <li>
                  <span className="dexina-step-num">02</span>
                  <div>
                    <h4>Verifikasi awal</h4>
                    <p>Informasi ditelaah untuk memperoleh kejelasan data dan menentukan kesesuaiannya dengan kewenangan KPI.</p>
                  </div>
                </li>
                <li>
                  <span className="dexina-step-num">03</span>
                  <div>
                    <h4>Penanganan sesuai prosedur</h4>
                    <p>Klarifikasi dan pemeriksaan dilakukan sesuai kebutuhan dengan memperhatikan hak pihak terkait dan praduga tidak bersalah.</p>
                  </div>
                </li>
                <li>
                  <span className="dexina-step-num">04</span>
                  <div>
                    <h4>Perlindungan informasi</h4>
                    <p>Informasi terbatas dikelola sesuai kewenangan. Kerahasiaan identitas dan martabat pihak terkait dilindungi penuh.</p>
                  </div>
                </li>
              </ol>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: TIGA PRINSIP
          ========================================================================= */}
      <section id="prinsip" className="dexina-section" aria-labelledby="principles-title">
        <div className="dexina-section__container">
          <div className="dexina-section__head">
            <div className="dexina-pill-label">CARA KAMI BEKERJA</div>
            <h2 id="principles-title" className="dexina-section__title">
              Tiga prinsip untuk proses yang dapat dipercaya.
            </h2>
          </div>

          <div className="dexina-principles-grid">
            <div className="dexina-principle-card">
              <div className="dexina-principle-card__num">01</div>
              <div className="dexina-principle-card__icon">
                <IconBook2 size={24} stroke={1.8} />
              </div>
              <h3>Edukatif</h3>
              <p>Membangun pemahaman dan kemampuan menjalankan interaksi yang sehat, beretika, dan bertanggung jawab antar-sesama mahasiswa.</p>
            </div>

            <div className="dexina-principle-card">
              <div className="dexina-principle-card__num">02</div>
              <div className="dexina-principle-card__icon">
                <IconEye size={24} stroke={1.8} />
              </div>
              <h3>Objektif</h3>
              <p>Informasi diterima sebagai bahan telaah, bukan langsung dianggap sebagai fakta atau vonis sebelum verifikasi berimbang.</p>
            </div>

            <div className="dexina-principle-card">
              <div className="dexina-principle-card__num">03</div>
              <div className="dexina-principle-card__icon">
                <IconShieldCheck size={24} stroke={1.8} />
              </div>
              <h3>Menjaga martabat</h3>
              <p>Hak, privasi, keamanan, dan kerahasiaan pihak terkait tetap diperhatikan secara ketat dalam setiap tahapan proses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: CTA BOX & MONUMENTAL WORDMARK
          ========================================================================= */}
      <section className="dexina-section" aria-labelledby="cta-title">
        <div className="dexina-section__container">
          <div className="dexina-cta-box">
            <div>
              <div className="dexina-pill-label dexina-pill-label--white">HUBUNGI KPI</div>
              <h2 id="cta-title" className="dexina-cta-box__h2">
                Ada situasi yang perlu disampaikan?
              </h2>
              <p className="dexina-cta-box__p">
                Gunakan kanal resmi. Setiap laporan dan pengaduan akan ditelaah sesuai prosedur, mandat, dan kewenangan KPI dengan jaminan perlindungan data.
              </p>
            </div>
            <Link className="dexina-btn-white" href="/publik/aspirasi">
              <span>Buka kanal aspirasi</span>
              <IconArrowRight size={17} stroke={2.4} />
            </Link>
          </div>
        </div>
      </section>

      {/* Monumental Wordmark Outro */}
      <div className="dexina-wordmark" aria-hidden="true">
        Peduli interaksi.
      </div>

      {/* Footer */}
      <footer className="dexina-footer">
        <div className="dexina-footer__inner">
          <div className="dexina-footer__left">
            <strong>KPI PPMI Mesir</strong>
            <span>Badan Semi Otonom PPMI Mesir Periode 2026&ndash;2027</span>
          </div>
          <div className="dexina-footer__right">
            <Link href="/publik">Informasi Publik</Link>
            <Link href="/publik/aspirasi">Kanal Aspirasi</Link>
            <Link href="/portal">Portal Pengurus</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
