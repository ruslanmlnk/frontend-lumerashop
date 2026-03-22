'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { HeaderMenus } from '@/types/site';

const NavigationContext = createContext<HeaderMenus>({
    desktopMenuItems: [],
    desktopOverflowMenuItems: [],
    mobileMenuItems: [],
});

export function NavigationProvider({
    children,
    initialMenuItems,
}: {
    children: ReactNode;
    initialMenuItems: HeaderMenus;
}) {
    return (
        <NavigationContext.Provider value={initialMenuItems}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    return useContext(NavigationContext);
}
