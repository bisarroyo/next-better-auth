import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { Loader2, UserCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ImpersonateUser({ userId }: { userId: string }) {
    const [isLoading, setIsLoading] = useState<string | undefined>()

    const router = useRouter()

    const handleImpersonateUser = async (id: string) => {
        setIsLoading(`impersonate-${id}`)
        try {
            await authClient.admin.impersonateUser({ userId: id })
            toast.success('Impersonated user')
            router.push('/')
            router.refresh()
        } catch (error: Error | unknown) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to impersonate user'
            )
        } finally {
            setIsLoading(undefined)
        }
    }
    return (
        <Button
            variant='secondary'
            size='sm'
            onClick={() => handleImpersonateUser(userId)}
            disabled={isLoading?.startsWith('impersonate')}>
            {isLoading === `impersonate-${userId}` ? (
                <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
                <>
                    <UserCircle className='h-4 w-4 mr-2' />
                    Impersonate
                </>
            )}
        </Button>
    )
}
