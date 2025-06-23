import { useNextTranslation } from '@/src/hooks/i18n'
import { isAxiosError } from 'axios'
import { Button, Card, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useCreatePublisher, useValidatePublisher } from 'src/api/generated'
import { customThemeTextInput } from 'utils/comfyTheme'

const CreatePublisherForm = () => {
    const { t } = useNextTranslation()
    const router = useRouter()
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

    const handleSubmit = (event) => {
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
                    toast.error('Could not create publisher. Please try again.')
                },
                onSuccess: () => {
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
        <section>
            <div className="flex items-center justify-center max-w-screen-xl px-4 py-16 mx-auto lg:grid lg:grid-cols-12 lg:gap-20 h-[90vh]">
                <div className="w-full col-span-12 mx-auto shadow bg-white-900 sm:max-w-lg md:mt-0 xl:p-0">
                    <Card className="max-w-md p-2 bg-gray-800 border border-gray-700 md:p-8 rounded-2xl">
                        <h1 className="flex text-2xl font-bold text-white ">
                            {t('Create a Publisher')}
                        </h1>
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
                                                <>{t('Checking username...')}</>
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

                            <div className="flex center gap-4">
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
                                    onClick={handleSubmit}
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
    )
}

export default CreatePublisherForm
