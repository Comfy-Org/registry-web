import { Button, Modal } from 'flowbite-react'
import React from 'react'
import { customThemeTModal } from 'utils/comfyTheme'
import { useNextTranslation } from '@/src/hooks/i18n'

type LocalizationContributeModalProps = {
    open: boolean
    onClose: () => void
}

export const LocalizationContributeModal: React.FC<
    LocalizationContributeModalProps
> = ({ open, onClose }) => {
    const { t } = useNextTranslation()

    const handleContribute = () => {
        window.open(
            'https://github.com/Comfy-Org/registry-web/issues/206',
            '_blank'
        )
        onClose()
    }

    return (
        <Modal
            show={open}
            size="md"
            onClose={onClose}
            popup
            //@ts-ignore
            theme={customThemeTModal}
            dismissible
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none">
                <Modal.Header className="!bg-gray-800">
                    <p className="text-white">
                        {t('Contribute to Localization')}
                    </p>
                </Modal.Header>
                <div className="space-y-6 p-2">
                    <div className="text-white space-y-4">
                        <p>
                            {t(
                                'Help us improve translations and add support for new languages!'
                            )}
                        </p>
                        <div className="space-y-2">
                            <h4 className="font-semibold">
                                {t('How to contribute:')}
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>
                                    {t(
                                        'Share improvement suggestions for existing translations'
                                    )}
                                </li>
                                <li>
                                    {t('Request support for new languages')}
                                </li>
                                <li>
                                    {t(
                                        'Report translation issues or missing text'
                                    )}
                                </li>
                                <li>
                                    {t('Volunteer to help with translations')}
                                </li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-300">
                            {t(
                                'Click the button below to visit our GitHub issue where you can share your feedback and suggestions.'
                            )}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            color="gray"
                            className="flex-1 text-white bg-gray-700"
                            onClick={onClose}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            color="blue"
                            className="flex-1"
                            onClick={handleContribute}
                        >
                            {t('Contribute on GitHub')}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}
