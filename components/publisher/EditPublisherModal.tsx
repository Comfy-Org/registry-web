import { Button, Modal, TextInput } from 'flowbite-react'
import React from 'react'
import { Publisher } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

type EditPublisherModalProps = {
  openModal: boolean
  onCloseModal: () => void
  onSubmit: (displayName: string) => void
  publisher: Publisher
}

const EditPublisherModal: React.FC<EditPublisherModalProps> = ({
  openModal,
  onCloseModal,
  publisher,
  onSubmit,
}) => {
  const { t } = useNextTranslation()
  const [displayName, setDisplayName] = React.useState<string>(
    publisher.name || ''
  )

  return (
    <Modal show={openModal} size="sm" onClose={onCloseModal} popup dismissible>
      <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8">
        <div className="space-y-6">
          <h3 className="text-2xl font-medium text-white">
            {t('Edit Publisher')}
          </h3>
          <form className="mt-4 space-y-4 lg:space-y-6">
            <div>
              <div>
                <label className=" mb-1 text-xs font-thin text-white">
                  {t('Username')}
                </label>
              </div>
              <div>
                <label className="mb-1 text-xs font-thin text-white">
                  {publisher.id}
                </label>
              </div>
            </div>
            <div>
              <label className=" mb-1 text-xs font-thin  text-white">
                {t('Display Name')}
              </label>
              <TextInput
                sizing="sm"
                style={{
                  background: '#4B5563',
                  borderColor: '#4B5563',
                  color: 'white',
                }}
                id="displayName"
                className="border-gray-700 placeholder-white"
                placeholder={publisher.name}
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <Button
                onClick={onCloseModal}
                type="button"
                color="light"
                className="w-full bg-gray-800 hover:!bg-gray-800"
              >
                <span className="text-xs text-white">{t('Cancel')}</span>
              </Button>
              <Button
                type="submit"
                className="w-full ml-1 "
                color="blue"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  onSubmit(displayName)
                }}
              >
                <span className="text-xs text-white">{t('Save Changes')}</span>
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  )
}
export default EditPublisherModal
