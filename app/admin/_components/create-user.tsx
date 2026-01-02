import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { authClient } from '@/lib/auth-client'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CreateUser() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        name: '',
        role: 'user' as const
    })
    const [isLoading, setIsLoading] = useState<string | undefined>()

    const queryClient = useQueryClient()

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading('create')
        try {
            await authClient.admin.createUser({
                email: newUser.email,
                password: newUser.password,
                name: newUser.name,
                role: newUser.role
            })
            toast.success('User created successfully')
            setNewUser({ email: '', password: '', name: '', role: 'user' })
            setIsDialogOpen(false)
            queryClient.invalidateQueries({
                queryKey: ['users']
            })
        } catch (error: Error | unknown) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to create user'
            )
        } finally {
            setIsLoading(undefined)
        }
    }
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className='mr-2 h-4 w-4' /> Create User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className='space-y-4'>
                    <div>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            id='email'
                            type='email'
                            value={newUser.email}
                            onChange={(e) =>
                                setNewUser({
                                    ...newUser,
                                    email: e.target.value
                                })
                            }
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor='password'>Password</Label>
                        <Input
                            id='password'
                            type='password'
                            value={newUser.password}
                            onChange={(e) =>
                                setNewUser({
                                    ...newUser,
                                    password: e.target.value
                                })
                            }
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor='name'>Name</Label>
                        <Input
                            id='name'
                            value={newUser.name}
                            onChange={(e) =>
                                setNewUser({
                                    ...newUser,
                                    name: e.target.value
                                })
                            }
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor='role'>Role</Label>
                        <Select
                            value={newUser.role}
                            onValueChange={(value: 'admin' | 'user') =>
                                setNewUser({
                                    ...newUser,
                                    role: value as 'user'
                                })
                            }>
                            <SelectTrigger>
                                <SelectValue placeholder='Select role' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='admin'>Admin</SelectItem>
                                <SelectItem value='user'>User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type='submit'
                        className='w-full'
                        disabled={isLoading === 'create'}>
                        {isLoading === 'create' ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Creating...
                            </>
                        ) : (
                            'Create User'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
