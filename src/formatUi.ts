import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { getImagePathFor } from './images';

interface IContext {
    project: string;
    organization: string;
    bashOverride?: string;
    // iconSize: number;
    // thumbnailSize: number;
}

const formatValue = (val: unknown) =>
    typeof val === 'string' ? `'${val}'` : String(val);

const formatLine = (
    text: string,
    options: {
        imageURL?: string;
        imageWidth?: number;
        imageHeight?: number;
        onclick?: 'href' | 'bash';
        icon?: string;
        bash?: string;
        href?: string;
        refresh?: boolean;
    }
) =>
    `${text.replace('|', '/')} | ${Object.entries(options)
        .map(([k, v]) => k + '=' + formatValue(v))
        .join(' ')}`;

export const formatUi = (context: IContext, workItems: WorkItem[]) =>
    formatLine(workItems.length.toString(), {}) +
    '\n' +
    workItems
        .filter(item => !!item.fields)
        .map(item =>
            formatLine(item.fields!['System.Title'], {
                href: `${context.organization}/${context.project}/_workitems/edit/${item.id}`,
                onclick: 'href',
                imageURL: getImagePathFor(item.fields!['System.ChangedBy'])
            })
        )
        .join('\n');
