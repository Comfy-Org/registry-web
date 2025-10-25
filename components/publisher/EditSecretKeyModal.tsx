import { Button, Modal, TextInput } from 'flowbite-react'
import { customThemeTModal } from 'utils/comfyTheme'
import { useNextTranslation } from '@/src/hooks/i18n'

export function EditSecretKeyModal({ openModal, onCloseModal }) {
    const { t } = useNextTranslation()
    return (
        <Modal
            show={openModal}
            size="sm"
            onClose={onCloseModal}
            popup
            dismissible
            //@ts-ignore
            theme={customThemeTModal}
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8">
                <div className="space-y-6">
                    <h3 className="text-2xl font-medium text-white">
                        {t('Edit secret key')}
                    </h3>
                    <form className="mt-4 space-y-4 lg:space-y-6">
                        <div>
                            <label className="block mb-1 text-xs font-bold text-white">
                                {t('Name')}{' '}
                                <span className="text-gray-400">
                                    {t('Optional')}
                                </span>
                            </label>
                            <TextInput
                                id="name"
                                placeholder={t('E.g. janedoe55')}
                                // required
                                className=""
                                style={{
                                    background: '#4B5563',
                                    borderColor: '#4B5563',
                                }}
                                type="text"
                                sizing="sm"
                                value=""
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-bold text-white">
                                {t('Description')}{' '}
                                <span className="text-gray-400">
                                    {t('Optional')}
                                </span>
                            </label>
                            <TextInput
                                sizing="sm"
                                style={{
                                    background: '#4B5563',
                                    borderColor: '#4B5563',
                                }}
                                id="displayName"
                                className="border-gray-700"
                                placeholder="E.g. Jane Doe "
                                // required
                                type="text"
                                value=""
                            />
                        </div>

                        <div className="flex justify-between">
                            <Button
                                onClick={onCloseModal}
                                type="button"
                                color="light"
                                className="w-full bg-gray-800 hover:!bg-gray-800"
                            >
                                <span className="text-xs text-white">
                                    {t('Cancel')}
                                </span>
                            </Button>
                            <Button
                                type="submit"
                                className="w-full ml-1 "
                                color="blue"
                                size="sm"
                            >
                                <span className="text-xs text-white">
                                    {t('Save Changes')}
                                </span>
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal.Body>
        </Modal>
    )
}
