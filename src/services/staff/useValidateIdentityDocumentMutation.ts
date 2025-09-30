import { buildQueryString, getRequest } from '../api'
import { IdentityDocumentValidationResult } from './staff.types'
import { API_PATH_VALIDATE_IDENTITY_DOCUMENT } from 'src/constants/routes'
import { useCustomMutation } from 'src/hooks/use-custom-mutation'

export function useValidateIdentityDocumentMutation() {
  return useCustomMutation<IdentityDocumentValidationResult, string>({
    mutationKey: ['staff', 'validate-identity-document'],
    mutationFn: async (identityDocument) => {
      const url = buildQueryString(API_PATH_VALIDATE_IDENTITY_DOCUMENT, {
        identityDocument,
      })
      const {
        data: { data },
      } = await getRequest<IdentityDocumentValidationResult>(url)

      return data
    },
  })
}
