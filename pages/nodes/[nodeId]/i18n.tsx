import { useState } from 'react'
import { useRouter } from 'next/router'
import {
    Breadcrumb,
    Card,
    Button,
    TextInput,
    Textarea,
    Select,
    Alert,
} from 'flowbite-react'
import { HiHome, HiSave, HiPlus, HiTrash } from 'react-icons/hi'
import { useNextTranslation } from '@/src/hooks/i18n'
import {
    useGetNode,
    useCreateNodeTranslations,
    useGetPermissionOnPublisherNodes,
    useGetUser,
} from '@/src/api/generated'
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/src/constants'
import type {
    NodeTranslations,
    CreateNodeTranslationsBody,
} from '@/src/api/generated'
import withAuth from '@/components/common/HOC/withAuth'

const NodeTranslationEditor = () => {
    const router = useRouter()
    const { nodeId } = router.query
    const { t } = useNextTranslation()

    const [selectedLanguage, setSelectedLanguage] = useState<string>('en')
    const [translations, setTranslations] = useState<NodeTranslations>({})
    const [newFieldKey, setNewFieldKey] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const {
        data: node,
        isLoading,
        error,
    } = useGetNode(
        nodeId as string,
        { include_translations: true },
        {
            query: {
                enabled: !!nodeId,
            },
        }
    )

    const publisherId = String(node?.publisher?.id || '')

    const { data: permissions } = useGetPermissionOnPublisherNodes(
        publisherId,
        nodeId as string,
        {
            query: {
                enabled: !!nodeId && !!publisherId,
            },
        }
    )

    const { data: user } = useGetUser()
    const isAdmin = user?.isAdmin
    const canEdit = isAdmin || permissions?.canEdit

    const createTranslationsMutation = useCreateNodeTranslations()

    const existingTranslations = node?.translations || {}

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language)
        if (!translations[language] && !existingTranslations[language]) {
            setTranslations({
                ...translations,
                [language]: {},
            })
        }
    }

    const getCurrentTranslations = () => {
        return {
            ...existingTranslations[selectedLanguage],
            ...translations[selectedLanguage],
        } as Record<string, string | string[]>
    }

    const updateTranslation = (field: string, value: string) => {
        setTranslations({
            ...translations,
            [selectedLanguage]: {
                ...translations[selectedLanguage],
                [field]: value,
            },
        })
    }

    const addNewField = () => {
        if (!newFieldKey.trim()) return

        updateTranslation(newFieldKey, '')
        setNewFieldKey('')
    }

    const removeField = (field: string) => {
        const updatedLangTranslations = { ...translations[selectedLanguage] }
        delete updatedLangTranslations[field]

        setTranslations({
            ...translations,
            [selectedLanguage]: updatedLangTranslations,
        })
    }

    const saveTranslations = async () => {
        if (!nodeId || !translations[selectedLanguage]) return

        const translationData: CreateNodeTranslationsBody = {
            data: {
                [selectedLanguage]: translations[selectedLanguage],
            },
        }

        try {
            await createTranslationsMutation.mutateAsync({
                nodeId: nodeId as string,
                data: translationData,
            })
            setSuccessMessage(t('Translation saved successfully!'))
            setErrorMessage('')
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (err) {
            setErrorMessage(t('Failed to save translation'))
            setSuccessMessage('')
            console.error('Translation save error:', err)
        }
    }

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-4"></div>
                    <div className="h-64 bg-gray-300 rounded"></div>
                </div>
            </div>
        )
    }

    if (error || !node) {
        return (
            <div className="p-4">
                <Alert color="failure">{t('Failed to load node data')}</Alert>
            </div>
        )
    }

    if (!canEdit) {
        return (
            <div className="p-4">
                <Alert color="warning">
                    {t(
                        'You do not have permission to edit translations for this node.'
                    )}
                </Alert>
            </div>
        )
    }

    const currentTranslations = getCurrentTranslations()
    const allFields = new Set([
        'name',
        'description',
        'category',
        'tags',
        ...Object.keys(currentTranslations),
    ])

    return (
        <div className="p-4 max-w-4xl mx-auto">
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
                        {t('All Nodes')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                        href={`/nodes/${nodeId}`}
                        onClick={(e) => {
                            e.preventDefault()
                            router.push(`/nodes/${nodeId}`)
                        }}
                        className="dark"
                    >
                        {node.name || (nodeId as string)}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="dark text-blue-500">
                        {t('Translations')}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('Node Translations')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {t('Manage translations for')}: <strong>{node.name}</strong>
                </p>
            </div>

            {successMessage && (
                <Alert color="success" className="mb-4">
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert color="failure" className="mb-4">
                    {errorMessage}
                </Alert>
            )}

            <Card>
                <div className="mb-4">
                    <label
                        htmlFor="language-select"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        {t('Select Language')}
                    </label>
                    <Select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {LANGUAGE_NAMES[lang]} ({lang})
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {t('Add New Field')}
                    </h3>
                    <div className="flex gap-2">
                        <TextInput
                            placeholder={t(
                                'Field name (e.g., description, category)'
                            )}
                            value={newFieldKey}
                            onChange={(e) => setNewFieldKey(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            onClick={addNewField}
                            disabled={!newFieldKey.trim()}
                            size="sm"
                        >
                            <HiPlus className="mr-2 h-4 w-4" />
                            {t('Add')}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {Array.from(allFields).map((field) => (
                        <div
                            key={field}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {field}
                                </label>
                                {![
                                    'name',
                                    'description',
                                    'category',
                                    'tags',
                                ].includes(field) && (
                                    <Button
                                        size="xs"
                                        color="failure"
                                        onClick={() => removeField(field)}
                                    >
                                        <HiTrash className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>

                            {field === 'description' ? (
                                <Textarea
                                    value={currentTranslations[field] || ''}
                                    onChange={(e) =>
                                        updateTranslation(field, e.target.value)
                                    }
                                    rows={3}
                                    placeholder={t(
                                        'Enter field translation...'
                                    )}
                                />
                            ) : (
                                <TextInput
                                    value={
                                        (currentTranslations[
                                            field
                                        ] as string) || ''
                                    }
                                    onChange={(e) =>
                                        updateTranslation(field, e.target.value)
                                    }
                                    placeholder={t(
                                        'Enter field translation...'
                                    )}
                                />
                            )}

                            {existingTranslations[selectedLanguage]?.[field] ? (
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('Original')}:{' '}
                                    {String(
                                        existingTranslations[selectedLanguage][
                                            field
                                        ]
                                    )}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={saveTranslations}
                        disabled={
                            createTranslationsMutation.isPending ||
                            !translations[selectedLanguage]
                        }
                        size="lg"
                    >
                        <HiSave className="mr-2 h-5 w-5" />
                        {createTranslationsMutation.isPending
                            ? t('Saving...')
                            : t('Save Translations')}
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default withAuth(NodeTranslationEditor)
