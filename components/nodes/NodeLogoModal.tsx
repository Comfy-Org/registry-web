import { Button, FileInput, Label, Modal } from 'flowbite-react'
import { useNextTranslation } from 'src/hooks/i18n'
import { customThemeTModal } from 'utils/comfyTheme'

export function NodeLogoModal({ openLogoModal, onCloseModal }) {
    const { t } = useNextTranslation()
    
    return (
        <>
            <Modal
                show={openLogoModal}
                size="2xl"
                onClose={onCloseModal}
                popup
                //@ts-ignore
                theme={customThemeTModal}
                dismissible
            >
                <Modal.Header className="!bg-gray-800 px-8 py-8">
                    <p className="text-white">{t('Upload Logo')}</p>
                </Modal.Header>
                <Modal.Body className="!bg-gray-800 p-20 md:px-9 md:py-1">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-full">
                            <Label
                                htmlFor="dropzone-file"
                                className="flex flex-col items-center justify-center w-full h-64 bg-gray-600 border-2 border-gray-500 border-dashed rounded-lg cursor-pointer hover:bg-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg
                                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 16"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                        />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">
                                            {t('Click to upload')}
                                        </span>{' '}
                                        {t('or drag and drop')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('SVG, PNG, JPG or GIF (MAX. 800x400px)')}
                                    </p>
                                    <Button color="blue" className="mt-2">
                                        <svg
                                            className="w-4 h-4 text-white"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-width="2"
                                                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                                            />
                                        </svg>
                                        {t('Browse File')}
                                    </Button>
                                </div>
                                <FileInput
                                    id="dropzone-file"
                                    className="hidden"
                                />
                            </Label>
                        </div>

                        <div className="flex justify-end gap-4 py-8 mt-8">
                            <Button
                                color="gray"
                                onClick={onCloseModal}
                                className="w-1/3 text-white bg-gray-800 "
                            >
                                {t('Cancel')}
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}
