import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Label, Modal, Textarea, TextInput } from 'flowbite-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  CustomThemeTextArea,
  customThemeTextInput,
  customThemeTModal,
} from 'utils/comfyTheme'
import {
  INVALIDATE_CACHE_OPTION,
  shouldInvalidate,
} from '@/components/cache-control'
import { ErrorResponse, Node, useUpdateNode } from '@/src/api/generated'
import nodesLogo from '@/src/assets/images/nodelogo2.png'
import { useNextTranslation } from '@/src/hooks/i18n'

type NodeEditModalProps = {
  openEditModal: boolean
  onCloseEditModal: () => void
  nodeData: Node
  publisherId: string
}

export const NodeEditModal: React.FC<NodeEditModalProps> = ({
  publisherId,
  openEditModal,
  onCloseEditModal,
  nodeData,
}) => {
  const { t } = useNextTranslation()
  const updateNodeMutation = useUpdateNode({})
  const queryClient = useQueryClient()
  const [nodeName, setNodeName] = useState('')
  // const [openLogoModal, setOpenLogoModal] = useState(false)
  const [description, setDescription] = useState('')
  const [license, setLicense] = useState('')
  const [githubLink, setGithubLink] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    if (nodeData) {
      setNodeName(nodeData.name || '')
      setDescription(nodeData.description || '')
      setLicense(nodeData.license || '')
      setGithubLink(nodeData.repository || '')
      setTags(nodeData.tags?.join(', ') || '')
    }
  }, [nodeData])
  // const handleOpenLogoModal = () => {
  //     onCloseEditModal()
  //     setOpenLogoModal(true)
  // }

  // const handleCloseLogoModal = () => {
  //     setOpenLogoModal(false)
  // }

  const handleUpdateNode = () => {
    if (nodeData.id) {
      const newTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      updateNodeMutation.mutate(
        {
          data: {
            id: nodeData.id, // solve missing id error
            name: nodeName,
            description: description,
            license: license,
            repository: githubLink,
            tags: newTags,
          },
          nodeId: nodeData.id,
          publisherId: publisherId,
        },
        {
          onSuccess: (data) => {
            // Cache-busting invalidation for cached endpoints
            queryClient.fetchQuery(
              shouldInvalidate.getGetNodeQueryOptions(
                nodeData.id!,
                undefined,
                INVALIDATE_CACHE_OPTION
              )
            )
            if (data) {
              toast.success(t('Node updated successfully'))
            } else {
              toast.error(t('Failed to update node'))
            }
          },
          onError: (error, variables, context) => {
            if (error instanceof AxiosError) {
              const axiosError: AxiosError<ErrorResponse, any> = error
              toast.error(
                t(`Failed to update node.\n{{detail}}`, {
                  detail: parseAxiosErrorResponse(axiosError),
                })
              )
            } else {
              toast.error(t('Failed to update node'))
            }
          },
        }
      )
    }
    onCloseEditModal()
  }

  return (
    <>
      <Modal
        show={openEditModal}
        size="3xl"
        onClose={onCloseEditModal}
        popup
        //@ts-ignore
        theme={customThemeTModal}
        dismissible
      >
        <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none ">
          <Modal.Header className="!bg-gray-800 px-8">
            <p className="text-white">{t('Edit Node')}</p>
          </Modal.Header>
          <div className="flex justify-evenly">
            <div className="relative max-w-sm transition-all duration-300 cursor-pointer ">
              <Image
                src={nodesLogo}
                alt="icon"
                width={200}
                height={200}
                className=""
              />
            </div>
            <div className="space-y-6 min-w-[350px]">
              <div>
                <div className="block mb-2">
                  <Label
                    htmlFor="name"
                    value={t('Node name')}
                    className="text-white"
                  />
                </div>
                <TextInput
                  //@ts-ignore
                  theme={customThemeTextInput}
                  id="name"
                  placeholder={t('Node name')}
                  onChange={(e) => setNodeName(e.target.value)}
                  value={nodeName}
                  required
                />
              </div>
              <div className="max-w-md">
                <div className="block mb-2">
                  <Label
                    htmlFor="comment"
                    value={t('Description')}
                    className="text-white"
                  />
                </div>
                <Textarea
                  id="comment"
                  theme={CustomThemeTextArea}
                  value={description}
                  placeholder={t('Description')}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={8}
                />
              </div>
              <div>
                <div className="block mb-2">
                  <Label
                    htmlFor="license"
                    value={t('License')}
                    className="text-white"
                  />
                </div>
                <TextInput
                  id="license"
                  theme={customThemeTextInput}
                  placeholder={t('Path To License File')}
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="block mb-2">
                  <Label
                    htmlFor="name"
                    value={t('Github Repository link')}
                    className="text-white"
                  />
                </div>
                <TextInput
                  id="name"
                  theme={customThemeTextInput}
                  placeholder={t('Github Repository link')}
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="block mb-2">
                  <Label
                    htmlFor="tags"
                    value={t('Tags (comma separated)')}
                    className="text-white"
                  />
                </div>
                <TextInput
                  id="tags"
                  theme={customThemeTextInput}
                  placeholder={t('Enter tags separated by commas')}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="mt-2 text-sm text-gray-400">
                  {t(
                    'Public tags visible to all users (e.g., video, audio, utility)'
                  )}
                </p>
              </div>

              <div className="flex mt-5">
                <Button
                  color="gray"
                  className="w-full text-white bg-gray-800"
                  onClick={onCloseEditModal}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  color="blue"
                  className="w-full ml-5"
                  onClick={handleUpdateNode}
                >
                  {t('Save Changes')}
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/* <NodeLogoModal
                openLogoModal={openLogoModal}
                onCloseModal={handleCloseLogoModal}
            /> */}
    </>
  )
}

function parseAxiosErrorResponse(
  axiosError: AxiosError<ErrorResponse, any>
): string {
  // TODO: extract this fn to utils and use for all api/generated requests errors
  return [axiosError.response?.data?.message, axiosError.response?.data?.error]
    .filter(Boolean)
    .join('\n')
}
