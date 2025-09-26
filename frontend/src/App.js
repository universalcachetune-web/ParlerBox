import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import * as d3 from 'd3';

function App() {
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [chartVisible, setChartVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const chartRef = useRef();
  const chartSvgRef = useRef();
  const heroRef = useRef();
  const problemsRef = useRef();
  const benefitsRef = useRef();
  const featuresRef = useRef();
  const subscribeRef = useRef();

  const heroStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/image1.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  };

  useEffect(() => {
    fetch('/api/features')
      .then(response => response.json())
      .then(data => setFeatures(data));

    fetch('/api/images')
      .then(response => response.json())
      .then(data => setImages(data));
  }, []);

  useEffect(() => {
    const element = chartRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartVisible(true);
        } else {
          setChartVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!chartRef.current) return;
      const rect = chartRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
        setScrollProgress(progress);
      } else if (rect.bottom <= 0) {
        setScrollProgress(1);
      } else {
        setScrollProgress(0);
      }
    };

    // Auto-scroll to subscribe section if URL contains /subscribe
    if (window.location.pathname === '/subscribe') {
      setTimeout(() => {
        scrollToSection('subscribe');
      }, 500);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!chartVisible) return;

    const data = [
      { year: '2025', cloud: 10000, parlerbox: 25000 },
      { year: '2026', cloud: 50000, parlerbox: 25000 },
      { year: '2027', cloud: 100000, parlerbox: 25000 }
    ];

    const svg = d3.select(chartSvgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, innerWidth]).padding(0.3);
    const y = d3.scaleLinear().range([innerHeight, 0]);

    x.domain(data.map(d => d.year));
    y.domain([0, d3.max(data, d => d.cloud)]);

    // Bars
    const bars = g.selectAll('.bar-group').data(data).enter().append('g').attr('class', 'bar-group');

    bars.attr('transform', d => `translate(${x(d.year)},0)`);

    // Cloud bars grow with scroll
    const cloudBars = bars.selectAll('.cloud-bar').data(d => [d]);
    cloudBars.enter().append('rect')
      .attr('class', 'cloud-bar')
      .attr('x', 0)
      .attr('width', x.bandwidth() / 2)
      .merge(cloudBars)
      .attr('y', d => y(d.cloud) + (innerHeight - y(d.cloud)) * (1 - scrollProgress))
      .attr('height', d => (innerHeight - y(d.cloud)) * scrollProgress)
      .attr('fill', '#f44336');

    // ParlerBox bars grow with scroll
    const parlerboxBars = bars.selectAll('.parlerbox-bar').data(d => [d]);
    parlerboxBars.enter().append('rect')
      .attr('class', 'parlerbox-bar')
      .attr('x', x.bandwidth() / 2)
      .attr('width', x.bandwidth() / 2)
      .merge(parlerboxBars)
      .attr('y', d => y(d.parlerbox) + (innerHeight - y(d.parlerbox)) * (1 - scrollProgress))
      .attr('height', d => (innerHeight - y(d.parlerbox)) * scrollProgress)
      .attr('fill', '#4caf50');

    // Text on bars
    const cloudTexts = bars.selectAll('.cloud-text').data(d => [d]);
    cloudTexts.enter().append('text')
      .attr('class', 'cloud-text')
      .merge(cloudTexts)
      .attr('x', x.bandwidth() / 4)
      .attr('y', d => y(d.cloud) + (innerHeight - y(d.cloud)) * (1 - scrollProgress) + 15)
      .attr('text-anchor', 'middle')
      .text(d => scrollProgress > 0.5 ? `$${d.cloud}` : '')
      .attr('fill', 'white');

    const parlerboxTexts = bars.selectAll('.parlerbox-text').data(d => [d]);
    parlerboxTexts.enter().append('text')
      .attr('class', 'parlerbox-text')
      .merge(parlerboxTexts)
      .attr('x', x.bandwidth() * 3 / 4)
      .attr('y', d => y(d.parlerbox) + (innerHeight - y(d.parlerbox)) * (1 - scrollProgress) + 15)
      .attr('text-anchor', 'middle')
      .text(d => scrollProgress > 0.5 ? `$${d.parlerbox}` : '')
      .attr('fill', 'white');

  }, [chartVisible, scrollProgress]);

  useEffect(() => {
    // Animate hero text on page load
    setTimeout(() => {
      if (heroRef.current) {
        const h2 = heroRef.current.querySelector('h2');
        if (h2) h2.classList.add('animated');
      }
    }, 500);

    const sections = [
      { ref: problemsRef, class: 'problems' },
      { ref: benefitsRef, class: 'benefits' },
      { ref: featuresRef, class: 'features' },
      { ref: subscribeRef, class: 'subscribe' }
    ];

    sections.forEach(({ ref, class: className }) => {
      if (ref.current) {
        const h2 = ref.current.querySelector('h2');
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              h2.classList.add('animated');
            }
          },
          { threshold: 0.5 }
        );
        observer.observe(ref.current);
      }
    });
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Subscription successful! Thank you.');
        setEmail('');
      } else {
        setMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <h1>ParlerBox</h1>
            <p>Find answers knowing your data, safely inside your firewall</p>
          </div>
          <nav className="nav">
            <button onClick={() => scrollToSection('home')} className="nav-link">Home</button>
            <button onClick={() => scrollToSection('problems')} className="nav-link">Problems</button>
            <button onClick={() => scrollToSection('benefits')} className="nav-link">Benefits</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button onClick={() => scrollToSection('subscribe')} className="nav-link">Subscribe</button>
            <button onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
          </nav>
        </div>
      </header>

      <main className="main">
        <section id="home" ref={heroRef} className="hero" style={heroStyle}>
          <div className="hero-overlay">
            <div className="hero-text">
              <h2><span>The</span> <span>Solution:</span> <span>ParlerBox</span></h2>
              <p>
                ParlerBox is on a mission to give every enterprise the power of instant, ChatGPT-grade search—without ever sacrificing security, compliance, or cost. We believe your data should stay where it belongs: inside your firewall, powering insights instead of cloud bills or repeated, wasted R&D.
              </p>
              <button onClick={() => scrollToSection('features')} className="cta-button">Explore Our Solution</button>
            </div>
          </div>
        </section>

        <section id="problems" className="problems-section">
          <div className="section-container">
            <h2>Current Enterprise Search Solutions Issues</h2>
            <div className="problems-grid">
              <div className="problem-card">
                <div className="problem-icon">💰</div>
                <h3>Cloud Costs Skyrocket</h3>
                <p>Cloud search bills skyrocket when queries run around the clock</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">🔓</div>
                <h3>Data Breach Risks</h3>
                <p>Cloud services are frequent targets for data breaches</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">📋</div>
                <h3>Industry Regulations</h3>
                <p>Enterprises face strict industry and government data regulations</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">⚡</div>
                <h3>Speed vs Cost vs Security</h3>
                <p>Teams need insights instantly, but current tools trade off cost, speed, or security</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">🔄</div>
                <h3>Reinventing the Wheel</h3>
                <p>Internal teams attempting to build solutions from scratch often reinvent the wheel—repeating the same data science work again and again without lasting value</p>
              </div>
              <div className="problem-card">
                <div className="problem-icon">📄</div>
                <h3>Custom Solutions for Diverse Data Types</h3>
                <p>Handling different kinds of data (images, text, PDFs, etc.) requires custom-tailored solutions, increasing complexity and development time</p>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="benefits-section">
          <div className="section-container">
            <h2>Benefits of ParlerBox from Day 1</h2>

            <div className="risk-comparison">
              <div className="comparison-title">Data Breach Risks Comparison</div>
              <div className="comparison-content">
                <div className="risk-item parlerbox">
                  <div className="risk-label">ParlerBox Data Breach Risks</div>
                  <div className="risk-bar" style={{ flex: '0 0 1px', width: '1px' }}>
                    <div className="risk-value">Very Low Risk</div>
                  </div>
                </div>
                <div className="risk-item cloud">
                  <div className="risk-label">Cloud Data Breach Risks</div>
                  <div className="risk-bar" style={{ width: '100%' }}>
                    <div className="risk-value">High Risk</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cost-comparison">
              <h3>Cost Savings Analysis</h3>
              <div ref={chartRef}>
                <svg ref={chartSvgRef} width="100%" height="300" viewBox="0 0 800 300"></svg>
              </div>
              <div className="cost-legend">
                <div className="legend-item cloud">Red: Cloud Costs</div>
                <div className="legend-item parlerbox">Green: ParlerBox Costs</div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section">
          <div className="section-container">
            <h2>Our Solution: How It Works</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">1</div>
                <div className="timeline-content">
                  <h3>Initial Contact</h3>
                  <p>Contact us to discuss your needs, specifications of your IT setup, data sources.</p>
                  <div className="timeline-day">Day 1</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <h3>Setup ParlerBox in Your Office</h3>
                  <p>Our specialist will setup ParlerBox on your office premises, connect to your sources.</p>
                  <div className="timeline-day">Days 2</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <h3>Data Sync & Discover</h3>
                  <p>Depending on the scale of your data, initial sync can take up to 1 day, we let the box sync with your data.</p>
                  <div className="timeline-day">Day 3</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">4</div>
                <div className="timeline-content">
                  <h3>Your Search</h3>
                  <p>Search, chat and analyze your data seamlessly in your office/home. Focus on scaling your business, we handle your questions.</p>
                  <div className="timeline-day">Day 4+</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <div className="section-container">
            <h2>Our Solution</h2>
            <div className="solution-image-container">
              <img src='/20250926_2116_Efficient Query Response_simple_compose_01k63q7q62e3wacxg996m9cpjy.png' alt='ParlerBox Solution' className="solution-image" />
            </div>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <i className={`fas ${feature.icon}`}></i>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="subscribe" className="subscribe-section">
          <div className="section-container">
            <h2>Get Early Access to ParlerBox</h2>
            <p>Join our early access program and be among the first to experience secure, internal-enterprise AI search</p>

            <form onSubmit={handleSubscribe} className="subscribe-form">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="subscribe-input" required />
              <button type="submit" disabled={isLoading} className="subscribe-button">
                {isLoading ? 'Subscribing...' : 'Subscribe for Early Access'}
              </button>
            </form>
            {message && <p className={`subscribe-message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}

            <div className="subscribe-benefits">
              <div className="benefit">
                <div className="benefit-icon">🚀</div>
                <h4>Be First</h4>
                <p>Get access before public release</p>
              </div>
              <div className="benefit">
                <div className="benefit-icon">💰</div>
                <h4>Priority Pricing</h4>
                <p>Special rates for early adopters</p>
              </div>
              <div className="benefit">
                <div className="benefit-icon">👥</div>
                <h4>Direct Support</h4>
                <p>Priority support from our team</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="section-container">
            <h2>Ready for What’s Next?</h2>
            <p>Let’s talk about bringing ParlerBox to your enterprise.</p>

            <div className="contact-info">
              <div className="contact-person">
                <h3>Keshav Singh</h3>
                <p>ParlerBox Founder</p>
              </div>
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">📧</div>
                  <div>
                    <strong>Email:</strong> hello.parlerbox@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 ParlerBox. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
