import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function DeleteUser({ userId }: { userId: string }) {
    const [isLoading, setIsLoading] = useState<string | undefined>()

    const queryClient = useQueryClient()

    const handleDeleteUser = async (id: string) => {
        setIsLoading(`delete-${id}`)
        try {
            await authClient.admin.removeUser({ userId: id })
            toast.success('User deleted successfully')
            queryClient.invalidateQueries({
                queryKey: ['users']
            })
        } catch (error: Error | unknown) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to delete user'
            )
        } finally {
            setIsLoading(undefined)
        }
    }
    return (
        <Button
            variant='destructive'
            size='sm'
            onClick={() => handleDeleteUser(userId)}
            disabled={isLoading?.startsWith('delete')}>
            {isLoading === `delete-${userId}` ? (
                <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
                <Trash className='h-4 w-4' />
            )}
        </Button>
    )
}
