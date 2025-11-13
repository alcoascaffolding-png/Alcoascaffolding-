/**
 * Professional Minimalistic Sidebar
 */

import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Icons } from '../ui/Icons';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [expandedSection, setExpandedSection] = useState('');

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
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-5 border-b border-gray-200">
            {isOpen ? (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Alcoa</h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Admin Panel</p>
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
                      className={({ isActive }) =>
                        `flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center px-3'} py-3 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
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
                      <button
                        onClick={() => isOpen && toggleSection(item.title)}
                        className={`w-full flex items-center ${isOpen ? 'justify-between px-4' : 'justify-center px-3'} py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700 group`}
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
                          <Icons.ChevronDown className={`transition-transform duration-200 ${
                            expandedSection === item.title ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>
                      
                      {/* Submenu */}
                      {isOpen && (
                        <div
                          className={`ml-4 mt-1 space-y-0.5 overflow-hidden transition-all duration-300 ${
                            expandedSection === item.title ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          {item.submenu && item.submenu.map((subItem, subIndex) => (
                            <NavLink
                              key={subIndex}
                              to={subItem.path}
                              className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200 border-l-2 ml-2 ${
                                  isActive
                                    ? 'bg-blue-50 border-blue-600 text-blue-600 font-semibold'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
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
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          {isOpen && (
            <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">© 2025 Alcoa</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
