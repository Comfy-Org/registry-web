import { isAxiosError } from 'axios'
import { Breadcrumb, Button, Card, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { HiHome } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { customThemeTextInput } from 'utils/comfyTheme'
import withAuth from '@/components/common/HOC/withAuth'
import { useCreatePublisher, useValidatePublisher } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

const CreatePublisher = () => {
    const router = useRouter()
    const { t } = useNextTranslation()

    const [username, setUsername] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [publisherValidationError, setPublisherValidationError] = useState('')

    const {
        data,
        isLoading: isLoadingValidation,
        error,
    } = useValidatePublisher({
        username: username,
    })
    const createPublisherMutation = useCreatePublisher()

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        createPublisherMutation.mutate(
            {
                data: {
                    id: username,
                    name: displayName,
                },
            },
            {
                onError: (error) => {
                    toast.error(
                        t('Could not create publisher. Please try again.')
                    )
                },
                onSuccess: () => {
                    toast.success('Publisher created successfully!')
                    router.push(`/publishers/${username}`)
                },
            }
        )
    }

    React.useEffect(() => {
        if (isAxiosError(error)) {
            setPublisherValidationError(error.response?.data?.message)
        } else {
            setPublisherValidationError('')
        }
    }, [error])

    return (
        <div className="p-4">
            <div className="py-4">
                <Breadcrumb>
                    <Breadcrumb.Item
                        href="/"
                        icon={HiHome}
                        onClick={(e) => {
                            e.preventDefault()
                            router.push('/')
                        }}
                        className="dark"
                    >
                        {t('Home')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="dark">
                        {t('Create Publisher')}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <section className="p-0">
                <div className="flex items-center justify-center px-0 py-4 mx-auto">
                    <div className="w-full mx-auto shadow sm:max-w-lg">
                        <Card className="p-2 bg-gray-800 border border-gray-700 md:p-6 rounded-2xl">
                            <p className="flex justify-center text-sm font-medium text-gray-400 ">
                                {t(
                                    'Register a publisher to begin distributing custom nodes on Comfy.'
                                )}
                            </p>

                            <form
                                className="mt-4 space-y-4 lg:space-y-6"
                                onSubmit={handleSubmit}
                            >
                                <div>
                                    <label className="block mb-1 text-xs font-bold text-white">
                                        {t('Username')}
                                    </label>
                                    <TextInput
                                        id="name"
                                        placeholder={t('E.g. janedoe55')}
                                        required
                                        theme={customThemeTextInput}
                                        type="text"
                                        sizing="sm"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        color={
                                            !isLoadingValidation &&
                                            publisherValidationError
                                                ? 'failure'
                                                : 'success'
                                        }
                                        helperText={
                                            <>
                                                {isLoadingValidation && (
                                                    <>
                                                        {t(
                                                            'Checking username...'
                                                        )}
                                                    </>
                                                )}
                                                {!isLoadingValidation &&
                                                    publisherValidationError && (
                                                        <>
                                                            <span className="font-medium"></span>{' '}
                                                            {
                                                                publisherValidationError
                                                            }
                                                        </>
                                                    )}
                                            </>
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-xs font-bold text-white">
                                        {t('Display Name')}
                                    </label>
                                    <TextInput
                                        sizing="sm"
                                        theme={customThemeTextInput}
                                        id="displayName"
                                        className="border-gray-700 "
                                        placeholder={t('E.g. Jane Doe')}
                                        required
                                        type="text"
                                        value={displayName}
                                        onChange={(e) =>
                                            setDisplayName(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        type="button"
                                        onClick={() => router.back()}
                                        color="light"
                                        className=" bg-gray-900"
                                    >
                                        <span className="text-white">
                                            {t('Cancel')}
                                        </span>
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="blue"
                                        size="sm"
                                        disabled={
                                            isLoadingValidation ||
                                            !!publisherValidationError
                                        }
                                    >
                                        {t('Create')}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default withAuth(CreatePublisher)
