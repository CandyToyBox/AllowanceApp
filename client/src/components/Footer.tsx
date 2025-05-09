export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-textSecondary mb-4 md:mb-0">
            © {new Date().getFullYear()} Smart Wallet Demo. Built with Smart Wallet and Base.
          </div>
          <div className="flex space-x-6">
            <a 
              href="https://docs.base.org/smart-wallet" 
              className="text-sm text-textSecondary hover:text-primary" 
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
            <a 
              href="https://github.com/base/demos" 
              className="text-sm text-textSecondary hover:text-primary" 
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a 
              href="https://base.org" 
              className="text-sm text-textSecondary hover:text-primary" 
              target="_blank"
              rel="noopener noreferrer"
            >
              Base
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
