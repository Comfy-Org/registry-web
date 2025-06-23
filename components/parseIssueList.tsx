import { zErrorArray } from './NodeStatusReason'

export function parseIssueList(statusReasonJson: any) {
    const issueListParseResult = zErrorArray.safeParse(
        statusReasonJson?.flatMap?.((i) => {
            // Unwind matches if present
            if (i.matches) {
                return i.matches.flatMap((match, matchIndex) =>
                    match.strings.flatMap((string) =>
                        string.instances.map((instance) => ({
                            ...i,
                            issue_type: i.issue_type || i.error_type || i.type,
                            file_path:
                                match.filepath ||
                                i.file_path ||
                                i.path ||
                                i.file ||
                                i.file_name ||
                                i.filename,
                            line_number: instance.line_number || -1,
                            code_snippet: instance.line || i.code_snippet,
                            matched_data: instance.matched_data,
                            matched_length: instance.matched_length,
                            offset: instance.offset,
                            matches: [{ ...match, strings: undefined }],
                            identifier: string.identifier,
                        }))
                    )
                )
            }
            // Default conversion for non-matching entries
            return {
                ...i,
                issue_type: i.issue_type || i.error_type || i.type,
                error_type: undefined,
                type: undefined,
                //
                file_path:
                    i.file_path ||
                    i.path ||
                    i.file ||
                    i.file_name ||
                    i.filename,
                path: undefined,
                file: undefined,
                file_name: undefined,
                filename: undefined,

                //
                line_number:
                    i.line_number ||
                    (typeof i.line === 'number' ? i.line : undefined) ||
                    -1,
                //
                code_snippet:
                    i.code_snippet ||
                    (typeof i.line === 'string' ? i.line : undefined) ||
                    i.content,

                content: undefined,
                line: undefined,
            }
        })
    )
    const issueList = issueListParseResult?.data
    return issueList
}
