import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RevokeSession({ userId }: { userId: string }) {
    const [isLoading, setIsLoading] = useState<string | undefined>()

    const handleRevokeSessions = async (id: string) => {
        setIsLoading(`revoke-${id}`)
        try {
            await authClient.admin.revokeUserSessions({ userId: id })
            toast.success('Sessions revoked for user')
        } catch (error: Error | unknown) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to revoke sessions'
            )
        } finally {
            setIsLoading(undefined)
        }
    }
    return (
        <Button
            variant='outline'
            size='sm'
            onClick={() => handleRevokeSessions(userId)}
            disabled={isLoading?.startsWith('revoke')}>
            {isLoading === `revoke-${userId}` ? (
                <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
                <RefreshCw className='h-4 w-4' />
            )}
        </Button>
    )
}
