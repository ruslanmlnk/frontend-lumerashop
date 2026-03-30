'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Download, MapPin, User, LogOut } from 'lucide-react';
import LogoutButton from './LogoutButton';

const ProfileNavigation = () => {
    const pathname = usePathname();

    const menuItems = [
        { label: 'Nástěnka', href: '/my-account', icon: LayoutDashboard },
        { label: 'Objednávky', href: '/my-account/orders', icon: ShoppingBag },
        { label: 'Stahování', href: '/my-account/downloads', icon: Download },
        { label: 'Adresa', href: '/my-account/edit-address', icon: MapPin },
        { label: 'Detaily účtu', href: '/my-account/edit-account', icon: User },
        { label: 'Odhlásit', href: '/my-account/logout', icon: LogOut },
    ];

    return (
        <nav className="w-full lg:w-[260px] shrink-0">
            <ul className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const className = `flex w-full items-center gap-3 px-4 py-3 text-[15px] transition-colors rounded-sm ${isActive
                            ? 'bg-gray-100 text-[#111111] font-semibold'
                            : 'text-gray-600 hover:text-[#111111] hover:bg-gray-50'
                        }`;

                    return (
                        <li key={item.label}>
                            {item.href === '/my-account/logout' ? (
                                <LogoutButton className={className}>
                                    <item.icon size={18} />
                                    {item.label}
                                </LogoutButton>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={className}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default ProfileNavigation;
