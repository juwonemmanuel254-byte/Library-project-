import { useEffect } from 'react'
import './LandingPage.css'
import imgExterior from '../assets/images/librarybackground.jpg'
import imgShelves  from '../assets/images/3729612269202568.jpg'
import imgWarm     from '../assets/images/44332377579540672.jpg'
import useScrollReveal from '../hooks/useScrollReveal'

const Icon = ({ name, size }) => (
  <span className="material-icons" style={size ? { fontSize: size } : {}}>{name}</span>
)

const LandingPage = ({ onSignup, onLogin }) => {
  useScrollReveal()

  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <header className="landing-nav animate-fade-in-down">
        <div className="landing-nav-brand">
          <Icon name="local_library" size="28px" />
          <span>LibraryMS</span>
        </div>
        <div className="landing-nav-actions">
          <button className="btn btn-outline landing-nav-btn" onClick={onLogin}>Sign In</button>
          <button className="btn btn-accent" onClick={onSignup}>Join Now</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <img src={imgExterior} alt="Library building" className="hero-bg-img" />
          <div className="hero-overlay" />
        </div>
        <div className="landing-hero-content">
          <div className="hero-badge animate-fade-in delay-1">
            <Icon name="local_library" /> Welcome to LibraryMS
          </div>
          <h1 className="animate-fade-in-left delay-2">
            Your Library,<br />At Your Fingertips
          </h1>
          <p className="animate-fade-in-left delay-3">
            Browse thousands of books, borrow what you love, and manage your
            reading history. All from one place. Joining is completely free.
          </p>
          <div className="landing-hero-btns animate-fade-in-up delay-4">
            <button className="btn btn-accent landing-cta" onClick={onSignup}>
              <Icon name="person_add" /> Create a Free Account
            </button>
            <button className="btn btn-outline landing-cta-outline" onClick={onLogin}>
              <Icon name="login" /> Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Photo gallery strip ── */}
      <section className="landing-gallery-section">
        <div className="gallery-section-header reveal">
          <h2>A Place for Every Reader</h2>
          <p>Step inside our library and discover a world of knowledge waiting for you.</p>
        </div>
        <div className="landing-gallery">
        <div className="gallery-item reveal-left">
          <img src={imgExterior} alt="Library entrance" />
          <div className="gallery-caption">
            <Icon name="location_on" /> Our Library Building
          </div>
        </div>
        <div className="gallery-item reveal delay-2">
          <img src={imgShelves} alt="Library bookshelves with light" />
          <div className="gallery-caption">
            <Icon name="menu_book" /> Thousands of Books
          </div>
        </div>
        <div className="gallery-item reveal-right delay-3">
          <img src={imgWarm} alt="Warm lit bookshelves" />
          <div className="gallery-caption">
            <Icon name="auto_stories" /> Every Genre Covered
          </div>
        </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <div className="container">
          <div className="section-header reveal">
            <h2>Everything You Need as a Library Member</h2>
            <p>A simple, modern way to interact with your library.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: 'search',              title: 'Browse the Catalog',    text: 'Search and filter through the full collection by title, author, or category.', delay: 'delay-1' },
              { icon: 'outbox',              title: 'Borrow Books',          text: 'Request to borrow any available book directly from the catalog with one click.', delay: 'delay-2' },
              { icon: 'history',             title: 'Track Your Borrows',    text: 'See all your active loans, due dates, and past borrowing history at a glance.', delay: 'delay-3' },
              { icon: 'notifications_active',title: 'Stay on Top of Dues',   text: 'Know exactly when each book is due so you never get an overdue fine.', delay: 'delay-4' },
            ].map((f) => (
              <div key={f.title} className={`feature-card reveal ${f.delay}`}>
                <div className="feature-icon"><Icon name={f.icon} size="32px" /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-steps">
        <div className="container">
          <div className="section-header reveal">
            <h2>How It Works</h2>
            <p>Up and running in three simple steps.</p>
          </div>
          <div className="steps-row">
            <div className="step reveal-left delay-1">
              <div className="step-number">1</div>
              <Icon name="person_add" size="36px" />
              <h3>Create an Account</h3>
              <p>Sign up with your name and email. Your member ID is generated automatically.</p>
            </div>
            <div className="step-arrow reveal delay-2"><Icon name="arrow_forward" size="28px" /></div>
            <div className="step reveal delay-2">
              <div className="step-number">2</div>
              <Icon name="search" size="36px" />
              <h3>Browse &amp; Select</h3>
              <p>Search the full catalog and click Borrow on any available book.</p>
            </div>
            <div className="step-arrow reveal delay-3"><Icon name="arrow_forward" size="28px" /></div>
            <div className="step reveal-right delay-3">
              <div className="step-number">3</div>
              <Icon name="move_to_inbox" size="36px" />
              <h3>Return When Done</h3>
              <p>Bring the book back within 14 days. The librarian processes the return.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta-section">
        <div className="cta-bg">
          <img src={imgShelves} alt="" aria-hidden="true" className="cta-bg-img" />
          <div className="cta-overlay" />
        </div>
        <div className="cta-content reveal">
          <h2>Ready to Start Reading?</h2>
          <p>Join our growing community of readers. Free membership, no commitment.</p>
          <button className="btn btn-accent landing-cta" onClick={onSignup}>
            <Icon name="person_add" /> Sign Up for Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <Icon name="local_library" />
          <span>LibraryMS</span>
        </div>
        <p>© {new Date().getFullYear()} LibraryMS. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default LandingPage
