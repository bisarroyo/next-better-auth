'use client'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { authClient } from '@/lib/auth-client'

import { useSession } from '@/hooks/useSession'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export function Header() {
    const { session, isPending } = useSession()

    const signOut = () =>
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = '/signin'
                }
            }
        })

    return (
        <header
            className='
            flex h-14 align-center justify-center px-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12
        backdrop-blur-xl bg-white/10 dark:bg-neutral-900/10
        border-b border-neutral-400/20 dark:border-neutral-700/20        supports-backdrop-filter:backdrop-blur-lg
      '>
            <section className='max-w-7xl w-full justify-between mx-auto flex-row flex items-center'>
                <div>
                    <Link href={'/'}>ACME</Link>
                </div>
                <div className='flex justify-end gap-2'>
                    <DropdownMenu>
                        {isPending ? (
                            <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
                        ) : (
                            <DropdownMenuTrigger
                                asChild
                                className='cursor-pointer'>
                                <Avatar>
                                    <AvatarImage
                                        src={
                                            session?.user.image ||
                                            '/avatar-placeholder.png'
                                        }
                                        alt='@shadcn'
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                        )}
                        <DropdownMenuContent className='w-40' align='start'>
                            <DropdownMenuLabel>
                                {session?.user.name}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>Perfil</DropdownMenuItem>
                                <DropdownMenuItem>Ajustes</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={signOut}
                                variant='destructive'>
                                Cerrar sesión
                                <DropdownMenuShortcut>
                                    <LogOut className='text-[#ff5470]' />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className='flex items-center gap-3'>
                        <ModeToggle />
                    </div>
                </div>
            </section>
        </header>
    )
}
