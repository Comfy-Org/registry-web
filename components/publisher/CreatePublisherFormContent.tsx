import { isAxiosError } from 'axios'
import { Button, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useNextTranslation } from 'src/hooks/i18n'
import { customThemeTextInput } from 'utils/comfyTheme'
import { useCreatePublisher, useValidatePublisher } from '@/src/api/generated'

type CreatePublisherFormContentProps = {
  onSuccess?: (username: string) => void
  onCancel?: () => void
  showTitle?: boolean
}

const CreatePublisherFormContent: React.FC<CreatePublisherFormContentProps> = ({
  onSuccess,
  onCancel,
  showTitle = false,
}) => {
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
          toast.error(t('Could not create publisher. Please try again.'))
        },
        onSuccess: () => {
          toast.success('Publisher created successfully!')
          if (onSuccess) {
            onSuccess(username)
          } else {
            router.push(`/publishers/${username}`)
          }
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
    <>
      {showTitle && (
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('Create Publisher')}
        </h2>
      )}
      <p className="flex justify-center text-sm font-medium text-gray-400 ">
        {t('Register a publisher to begin distributing custom nodes on Comfy.')}
      </p>

      <form className="mt-4 space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
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
            onChange={(e) => setUsername(e.target.value)}
            color={
              !isLoadingValidation && publisherValidationError
                ? 'failure'
                : 'success'
            }
            helperText={
              <>
                {isLoadingValidation && <>{t('Checking username...')}</>}
                {!isLoadingValidation && publisherValidationError && (
                  <>
                    <span className="font-medium"></span>{' '}
                    {publisherValidationError}
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
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex center gap-4">
          <Button
            type="button"
            onClick={onCancel}
            color="light"
            className=" bg-gray-900"
          >
            <span className="text-white">{t('Cancel')}</span>
          </Button>
          <Button
            type="submit"
            color="blue"
            size="sm"
            disabled={isLoadingValidation || !!publisherValidationError}
          >
            {t('Create')}
          </Button>
        </div>
      </form>
    </>
  )
}

export default CreatePublisherFormContent
