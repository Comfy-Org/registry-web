import { useNextTranslation } from '@/src/hooks/i18n'
import { Button, Modal } from 'flowbite-react'
import React from 'react'
import { customThemeTModal } from 'utils/comfyTheme'

type CopyAccessTokenModalProps = {
  openModal: boolean
  onCloseModal: () => void
  accessToken: string
}

export const CopyAccessTokenModal: React.FC<CopyAccessTokenModalProps> = ({
  openModal,
  onCloseModal,
  accessToken,
}) => {
  const { t } = useNextTranslation()
  const handleSubmit = (event) => {
    event.preventDefault()
  }
  // Copy a string to the clipboard
  const copyToClipboard = (accessToken: string) => {
    navigator.clipboard.writeText(accessToken).then(() => {
      const successMessage = document.getElementById('success-message')
      const defaultMessage = document.getElementById('default-message')
      if (successMessage && defaultMessage) {
        successMessage.classList.remove('hidden')
        defaultMessage.classList.add('hidden')
      }
    })
  }

  return (
    <Modal
      show={openModal}
      size="sm"
      onClose={onCloseModal}
      popup
      //@ts-ignore
      theme={customThemeTModal}
      dismissible
    >
      <Modal.Body className="!bg-gray-800 p-8  md:px-7 md:py-7">
        <form className="mt-4 space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <h3 className="text-2xl font-medium text-white">
              {t('Save your key')}
            </h3>
            <p className="text-gray-200 text-[14px]">
              {t(
                "Please save this secret key somewhere safe and accessible. If you lose this secret key, you'll need to generate a new one. It can only be copied once."
              )}
            </p>

            <div className="grid grid-cols-8 gap-2 w-full max-w-[23rem]">
              <label className="sr-only">Label</label>
              <input
                id="npm-install"
                type="text"
                className="col-span-6 size-10 bg-gray-50 border text-sm rounded-lg block w-full p-2.5bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={accessToken}
                disabled
                style={{
                  background: '#4B5563',
                  borderColor: '#4B5563',
                }}
              />
              <button
                onClick={() => copyToClipboard(accessToken)}
                data-copy-to-clipboard-target="npm-install"
                className="col-span-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 items-center inline-flex justify-center"
              >
                <span id="default-message " className="text-xs">
                  {t('Copy')}
                </span>
                <span id="success-message" className="items-center hidden ">
                  <svg
                    className="w-3 h-3 text-white me-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M1 5.917 5.724 10.5 15 1.5"
                    />
                  </svg>
                  {t('Copied!')}
                </span>
              </button>
            </div>
          </div>
          <div className="flex justify-end mt-5">
            <Button
              type="submit"
              className="w-1/3 mt-2 "
              color="blue"
              size="sm"
              onClick={onCloseModal}
            >
              <span className="text-xs text-white">{t('Done')}</span>
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}
