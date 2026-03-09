'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { NavItem } from '@/types/site';

const NavigationContext = createContext<{ menuItems: NavItem[] }>({
    menuItems: [],
});

export function NavigationProvider({
    children,
    initialMenuItems,
}: {
    children: ReactNode;
    initialMenuItems: NavItem[];
}) {
    return (
        <NavigationContext.Provider value={{ menuItems: initialMenuItems }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    return useContext(NavigationContext);
}
