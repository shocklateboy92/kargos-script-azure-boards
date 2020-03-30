import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as fs from 'fs';
import { RequestOptions } from 'http';
import * as http from 'https';
import * as os from 'os';
import { IRequestHandler } from 'typed-rest-client/Interfaces';
import { info } from './logger';
import { IdentityRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';

const IMAGE_CACHE_PATH = `${os.tmpdir()}/pr-notify-image-cache/`;

export const getImagePathFor = (pr: IdentityRef) => IMAGE_CACHE_PATH + pr.id;

export function fetchImages(
    authHandler: IRequestHandler,
    prList: IdentityRef[]
) {
    // Rather expensive way of doing Set.Distinct()
    const uniqueAuthors = prList.filter(
        (pr, index) => prList.findIndex(pri => pri.id == pr.id) === index
    );

    info(`Found ${uniqueAuthors.length} authors. Downloading images...`);

    try {
        // CBF make this async.
        fs.mkdirSync(IMAGE_CACHE_PATH);
    } catch (err) {
        // Since we're unconditionally creating this, we swallow EEXIST
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    // Grab the auth headers we need for fetching images
    const requestOptions = { headers: {} };
    authHandler.prepareRequest(requestOptions);

    return Promise.all(
        uniqueAuthors.map(author =>
            author?.imageUrl
                ? download(
                      requestOptions,
                      author.imageUrl,
                      IMAGE_CACHE_PATH + author.id
                  )
                : Promise.resolve()
        )
    );
}

/**
 * Utility function that will download a file to a given path.
 * @param url url of the resource to fetch (source)
 * @param dest full path of the file to write to (dest)
 */
const download = (options: RequestOptions, url: string, dest: string) =>
    new Promise<void>((resolve, reject) => {
        // Early exit if the file already exists
        fs.access(dest, fs.constants.F_OK, err => {
            if (err) {
                // File doesn't already exist. Go download it
                const file = fs.createWriteStream(dest, { flags: 'wx' });
                const request = http
                    .get(url, options, function(response) {
                        response.pipe(file);
                        file.on('finish', file.close)
                            .on('close', resolve)
                            .on('error', reject);
                    })
                    .on('error', function(err) {
                        // Delete the file async. (But we don't check the result)
                        fs.unlink(dest, _ => null);
                        reject(err);
                    });
            } else {
                // File already exists. Nothing to do.
                resolve();
            }
        });
    });
