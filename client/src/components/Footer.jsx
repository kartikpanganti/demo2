const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>© {year} Medicine Inventory Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 