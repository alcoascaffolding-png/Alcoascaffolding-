/**
 * Professional Minimalistic Sidebar
 */

import { useEffect } from 'react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icons } from '../ui/Icons';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [expandedSection, setExpandedSection] = useState('');
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Icons.Dashboard,
      path: '/',
    },
    {
      title: 'Contact Messages',
      icon: Icons.Messages,
      path: '/contact-messages',
    },
    {
      title: 'Customer Relations',
      icon: Icons.Customers,
      submenu: [
        { title: 'Customers', path: '/customers', icon: Icons.Customers },
        { title: 'Quotes', path: '/quotes', icon: Icons.Quotes },
        { title: 'Sales Orders', path: '/sales-orders', icon: Icons.Orders },
        { title: 'Sales Invoices', path: '/sales-invoices', icon: Icons.Invoice },
      ],
    },
    {
      title: 'Vendor Relations',
      icon: Icons.Vendors,
      submenu: [
        { title: 'Vendors', path: '/vendors', icon: Icons.Vendors },
        { title: 'Purchase Orders', path: '/purchase-orders', icon: Icons.Orders },
        { title: 'Purchase Invoices', path: '/purchase-invoices', icon: Icons.Invoice },
      ],
    },
    {
      title: 'Inventory',
      icon: Icons.Products,
      submenu: [
        { title: 'Products', path: '/products', icon: Icons.Products },
        { title: 'Stock Adjustments', path: '/stock-adjustments', icon: Icons.Inventory },
      ],
    },
    // {
    //   title: 'Accounts',
    //   icon: Icons.BankAccount,
    //   submenu: [
    //     { title: 'Bank Accounts', path: '/bank-accounts', icon: Icons.BankAccount },
    //     { title: 'Receipts', path: '/receipts', icon: Icons.Receipt },
    //     { title: 'Payments', path: '/payments', icon: Icons.Payment },
    //   ],
    // },
  ];

  const toggleSection = (title) => {
    setExpandedSection(expandedSection === title ? '' : title);
  };

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const sectionWithActiveRoute = menuItems.find(
      (item) => item.submenu && item.submenu.some((subItem) => location.pathname.startsWith(subItem.path))
    );

    if (sectionWithActiveRoute) {
      setExpandedSection(sectionWithActiveRoute.title);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${
          isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-5 border-b border-gray-200 bg-gray-50/70">
            {isOpen ? (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Alcoa</h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5 uppercase tracking-wide">Admin Panel</p>
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.path ? (
                    // Single Menu Item
                    <NavLink
                      to={item.path}
                      end
                      onClick={handleMobileNavClick}
                      className={({ isActive }) =>
                        `flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center px-3'} py-3 rounded-lg transition-all duration-200 group border ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm'
                            : 'text-gray-700 border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`
                      }
                      title={!isOpen ? item.title : ''}
                    >
                      <div className="flex-shrink-0">
                        <item.icon />
                      </div>
                      {isOpen && (
                        <span className="ml-3 font-medium text-sm whitespace-nowrap">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  ) : (
                    // Menu with Submenu
                    <div>
                      {(() => {
                        const hasActiveSubmenu = item.submenu?.some((subItem) =>
                          location.pathname.startsWith(subItem.path)
                        );

                        return (
                      <button
                        onClick={() => isOpen && toggleSection(item.title)}
                        className={`w-full flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center px-3'} py-3 rounded-lg border transition-all duration-200 group ${
                          hasActiveSubmenu
                            ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                            : 'text-gray-700 border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`}
                        title={!isOpen ? item.title : ''}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <item.icon />
                          </div>
                          {isOpen && (
                            <span className="ml-3 font-medium text-sm whitespace-nowrap">
                              {item.title}
                            </span>
                          )}
                        </div>
                        {isOpen && (
                          <Icons.ChevronDown className={`transition-transform duration-200 text-gray-500 ${
                            expandedSection === item.title ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>
                        );
                      })()}
                      
                      {/* Submenu */}
                      {isOpen && (
                        <div
                          className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                            expandedSection === item.title ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="pl-3 border-l border-gray-200">
                            {item.submenu && item.submenu.map((subItem, subIndex) => (
                              <NavLink
                                key={subIndex}
                                to={subItem.path}
                                onClick={handleMobileNavClick}
                                className={({ isActive }) =>
                                  `flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-600 font-semibold'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                  }`
                                }
                              >
                                <div className="flex-shrink-0">
                                  <subItem.icon />
                                </div>
                                <span className="ml-3 whitespace-nowrap">{subItem.title}</span>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
            {isOpen ? (
              <p className="text-xs text-gray-500 text-center">© 2026 Alcoa</p>
            ) : (
              <p className="text-[10px] text-gray-400 text-center">©26</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
