const Footer = () => (
  <footer className="bg-dark text-white py-4 mt-auto">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
          <i className="bi bi-mortarboard-fill me-2" style={{ color: '#457b9d' }} />
          <strong>Skillify</strong>
          <span className="text-muted ms-2">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="col-md-6 text-center text-md-end">
          <a href="#" className="text-muted me-3" title="Twitter"><i className="bi bi-twitter-x fs-5" /></a>
          <a href="#" className="text-muted me-3" title="GitHub"><i className="bi bi-github fs-5" /></a>
          <a href="#" className="text-muted" title="LinkedIn"><i className="bi bi-linkedin fs-5" /></a>
        </div>
      </div>
    </div>
  </footer>
)
export default Footer
