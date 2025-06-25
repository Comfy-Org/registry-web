import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb } from 'flowbite-react'
import { HiHome } from 'react-icons/hi'
import Registry from '../components/registry/Registry'

function NodeList() {
    const { t } = useNextTranslation()

    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item href="/" icon={HiHome} className="dark">
                    {t('Home')}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Registry />
        </div>
    )
}

export default NodeList
