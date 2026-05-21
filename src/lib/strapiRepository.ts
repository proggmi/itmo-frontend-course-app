import {
    type Author,
    type AuthorComment,
    type Company,
    type Course,
    type Education,
    type Favourite,
    type Presentation,
    type PresentationStatus,
    type ProgressBar,
    type Skill,
    type Tag,
    type TimeRange,
    type VotedAuthor
} from '$lib/index';
import {
    assert,
    assertValidAuthor,
    assertValidComment,
    assertValidCompany,
    assertValidCourse,
    assertValidEducation,
    assertValidFavourite,
    assertValidPresentation,
    assertValidPresentationStatus,
    assertValidProgressBar,
    assertValidSkill,
    assertValidTag,
    assertValidTimeRange,
    assertValidVotedAuthor
} from '$lib/errors';
import Strapi from 'strapi-sdk-js';

type TypeString =
    | 'undefined'
    | 'object'
    | 'boolean'
    | 'number'
    | 'string'
    | 'function'
    | 'symbol'
    | 'bigint';

function assertField(
    condition: boolean,
    fieldName: string,
    fieldType: TypeString | 'Array'
): asserts condition {
    assert(condition, `object must have field ${fieldName}: ${fieldType}`);
}

/**
 * This function parses the course from the json format into the {@linkcode Course} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
function parseSkill(json: object): Skill {
    assertField('id' in json && typeof json.id === 'number', 'id', 'number');
    assertField(
        'skill_name' in json && typeof json.skill_name === 'string',
        'skill_name',
        'string'
    );
    assertField(
        'skill_percent' in json && typeof json.skill_percent === 'number',
        'skill_percent',
        'number'
    );
    const result = { id: json.id.toString(), name: json.skill_name, value: json.skill_percent };
    assertValidSkill(result);
    return result;
}

function parseTimeRange(json: object): TimeRange {
    assertField(
        'educate_end' in json && typeof json.educate_end === 'string',
        'educate_end',
        'string'
    );
    assertField(
        'educate_start' in json && typeof json.educate_start === 'string',
        'educate_start',
        'string'
    );
    const result = { start: parseInt(json.educate_start), end: parseInt(json.educate_end) };
    assertValidTimeRange(result);
    return result;
}

function parseEducation(json: object): Education {
    assertField('id' in json && typeof json.id === 'number', 'id', 'number');
    assertField(
        'education_name' in json && typeof json.education_name === 'string',
        'education_name',
        'string'
    );
    assertField(
        'education_level' in json && typeof json.education_level === 'string',
        'education_level',
        'string'
    );
    const result = {
        id: json.id.toString(),
        title: json.education_name,
        subtitle: json.education_level,
        timeRange: parseTimeRange(json)
    };
    assertValidEducation(result);
    return result;
}

/**
 * This function parses the presentation status from the json format into the {@linkcode PresentationStatus} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parsePresentationStatus(json: object): Promise<PresentationStatus> {
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField(
        'presentation_document_id' in json && typeof json.presentation_document_id === 'string',
        'presentation_document_id',
        'string'
    );
    assertField(
        'progress_bar_document_id' in json && typeof json.progress_bar_document_id === 'string',
        'progress_bar_document_id',
        'string'
    );

    const result = {
        id: json.documentId,
        presentationDocumentId: json.presentation_document_id,
        progressBarDocumentId: json.progress_bar_document_id
    };
    assertValidPresentationStatus(result);
    return result;
}

/**
 * This function parses the progress bar from the json format into the {@linkcode ProgressBar} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parseProgressBar(json: object): Promise<ProgressBar> {
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField(
        'course_document_id' in json && typeof json.course_document_id === 'string',
        'course_document_id',
        'string'
    );
    assertField(
        'person_document_id' in json && typeof json.person_document_id === 'string',
        'person_document_id',
        'string'
    );
    assertField(
        'presentation_statuses' in json && Array.isArray(json.presentation_statuses),
        'presentation_statuses',
        'Array'
    );

    const result = {
        id: json.documentId,
        presentations: await Promise.all(json.presentation_statuses.map(parsePresentationStatus)),
        courseDocumentId: json.course_document_id,
        personDocumentId: json.person_document_id
    };
    assertValidProgressBar(result);
    return result;
}

/**
 * Brings the phone to the view of a valid link.
 * @param phone string
 */
function toHRef(phone: string): string {
    phone = phone.replace(/(?!^)\+|\D/g, '');
    return phone.startsWith('7') ? `tel:+${phone}` : `tel:${phone}`;
}

/**
 * This function parses the person from the json format into the {@linkcode Author} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parseAuthor(json: unknown): Promise<Author> {
    assert(typeof json === 'object' && json !== null, 'json must be object');
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField(
        'person_name' in json && typeof json.person_name === 'string',
        'person_name',
        'string'
    );
    assertField('companies' in json && Array.isArray(json.companies), 'companies', 'Array');
    assertField('skills' in json && Array.isArray(json.skills), 'skills', 'Array');
    assertField('educations' in json && Array.isArray(json.educations), 'educations', 'Array');
    assertField(
        'person_address' in json && typeof json.person_address === 'string',
        'person_address',
        'string'
    );
    assertField(
        'person_birthday' in json &&
            (typeof json.person_birthday === 'string' || typeof json.person_birthday === 'object'),
        'person_birthday',
        'string'
    );
    assertField(
        'person_city' in json &&
            (typeof json.person_city === 'string' || typeof json.person_city === 'object'),
        'person_city',
        'string'
    );
    assertField(
        'person_description' in json &&
            (typeof json.person_description === 'string' ||
                typeof json.person_description === 'object'),
        'person_description',
        'string'
    );
    assertField(
        'person_github' in json &&
            (typeof json.person_github === 'string' || typeof json.person_github === 'object'),
        'person_github',
        'string'
    );
    assertField(
        'person_telegram' in json &&
            (typeof json.person_telegram === 'string' || typeof json.person_telegram === 'object'),
        'person_telegram',
        'string'
    );
    assertField(
        'person_phone' in json && typeof json.person_phone === 'string',
        'person_phone',
        'string'
    );
    assertField(
        'person_email' in json && typeof json.person_email === 'string',
        'person_email',
        'string'
    );
    const address = { value: json.person_address, href: '' };
    // assertValidContact(address);
    const phone = { value: json.person_phone, href: toHRef(json.person_phone) };
    // assertValidContact(phone);
    const email = { value: json.person_email, href: `mailto:${json.person_email}` };
    // assertValidContact(email);
    assertField(
        'progress_bars' in json && Array.isArray(json.progress_bars),
        'progress_bars',
        'Array'
    );
    assertField('favourites' in json && Array.isArray(json.favourites), 'favourites', 'Array');
    assertField('companies' in json && Array.isArray(json.companies), 'companies', 'Array');
    assertField(
        'created_presentations' in json && Array.isArray(json.created_presentations),
        'created_presentations',
        'Array'
    );

    const result = {
        id: json.documentId,
        name: json.person_name,
        address: address,
        phone: phone,
        email: email,
        authorBirthday: typeof json.person_birthday === 'object' ? '' : json.person_birthday,
        authorCity: typeof json.person_city === 'object' ? '' : json.person_city,
        authorDescription:
            typeof json.person_description === 'object' ? '' : json.person_description,
        skills: json.skills.map(parseSkill),
        educations: json.educations.map(parseEducation),
        companies: json.companies.map(parseCompany),
        progressBars: await Promise.all(json.progress_bars.map(parseProgressBar)),
        favourites: json.favourites.map(parseFavourite),
        createdPresentationDocumentIds: json.created_presentations.map((value: object) => {
            assertField(
                'documentId' in value && typeof value.documentId === 'string',
                'documentId',
                'string'
            );
            return value.documentId;
        }),
        authorTelegram: typeof json.person_telegram === 'object' ? '' : json.person_telegram,
        authorGithub: typeof json.person_github === 'object' ? '' : json.person_github
    };
    assertValidAuthor(result);
    return result;
}

/**
 * This function parses the favourite presentation from the json format into the {@linkcode Favourite} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
function parseFavourite(json: unknown): Favourite {
    assert(typeof json === 'object' && json !== null, 'json must be object');
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField(
        'person_document_id' in json && typeof json.person_document_id === 'string',
        'person_document_id',
        'string'
    );
    assertField(
        'presentation_document_id' in json && typeof json.presentation_document_id === 'string',
        'presentation_document_id',
        'string'
    );
    const result = {
        id: json.documentId,
        presentationDocumentId: json.presentation_document_id,
        authorDocumentId: json.person_document_id
    };
    assertValidFavourite(result);
    return result;
}

/**
 * This function parses the company from the json format into the {@linkcode Company} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
function parseCompany(json: unknown): Company {
    assert(typeof json === 'object' && json !== null, 'json must be object');
    assertField('id' in json && typeof json.id === 'number', 'id', 'number');
    assertField(
        'company_name' in json && typeof json.company_name === 'string',
        'company_name',
        'string'
    );
    assertField(
        'company_description' in json && typeof json.company_description === 'string',
        'company_description',
        'string'
    );
    assertField(
        'position' in json &&
            (typeof json.position === 'string' || typeof json.position === 'object'),
        'position',
        'string'
    );
    assertField(
        'period' in json && (typeof json.period === 'string' || typeof json.period === 'object'),
        'period',
        'string'
    );
    const result = {
        id: json.id.toString(),
        companyName: json.company_name,
        companyDescription: json.company_description,
        position: typeof json.position === 'object' ? '' : json.position,
        period: typeof json.period === 'object' ? '' : json.period
    };
    assertValidCompany(result);
    return result;
}

/**
 * This function parses the person comment from the json format into the {@linkcode Comment} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parseComment(json: unknown): Promise<AuthorComment> {
    assert(typeof json === 'object' && json !== null, 'json must be object');

    assertField(
        'comment_description' in json && typeof json.comment_description === 'string',
        'comment_description',
        'string'
    );
    assertField(
        'person' in json && typeof json.person === 'object' && json.person !== null,
        'person',
        'object'
    );
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField(
        'documentId' in json.person && typeof json.person.documentId === 'string',
        'documentId',
        'string'
    );

    const result = {
        id: json.documentId,
        commentDescription: json.comment_description,
        author: await getAuthorByDocumentId(json.person.documentId)
    };
    assertValidComment(result);
    return result;
}

/**
 * This function parses the voted person from the json format into the {@linkcode VotedAuthor} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parseVotedAuthor(json: unknown): Promise<VotedAuthor> {
    assert(typeof json === 'object' && json !== null, 'json must be object');
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField(
        'presentation_document_id' in json && typeof json.presentation_document_id === 'string',
        'presentation_document_id',
        'string'
    );
    assertField(
        'person_document_id' in json && typeof json.person_document_id === 'string',
        'person_document_id',
        'string'
    );
    assertField(
        'person_score' in json && typeof json.person_score === 'number',
        'person_score',
        'number'
    );
    const result = {
        id: json.documentId,
        presentationDocumentId: json.presentation_document_id,
        authorDocumentId: json.person_document_id,
        authorScore: json.person_score
    };
    assertValidVotedAuthor(result);
    return result;
}

/**
 * This function parses the presentation from the json format into the {@linkcode Presentation} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parsePresentation(json: unknown): Promise<Presentation> {
    assert(typeof json === 'object' && json !== null, 'json must be object');

    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField(
        'presentation_name' in json && typeof json.presentation_name === 'string',
        'presentation_name',
        'string'
    );

    assertField(
        'presentation_description' in json && typeof json.presentation_description === 'string',
        'presentation_description',
        'string'
    );
    assertField(
        'presentation_url' in json && typeof json.presentation_url === 'string',
        'presentation_url',
        'string'
    );
    assertField(
        'presentation_preview' in json &&
            typeof json.presentation_preview === 'object' &&
            json.presentation_preview != null,
        'presentation_preview',
        'object'
    );
    assertField(
        'url' in json.presentation_preview && typeof json.presentation_preview.url === 'string',
        'url',
        'string'
    );
    let presentation_owners = [];
    if ('presentation_owners' in json && Array.isArray(json.presentation_owners)) {
        presentation_owners = json.presentation_owners;
    }
    let comments = [];
    if ('comments' in json && Array.isArray(json.comments)) {
        comments = json.comments;
    }
    let voted_people = [];
    if ('voted_people' in json && Array.isArray(json.voted_people)) {
        voted_people = json.voted_people;
    }
    assertField(
        'course' in json && typeof json.course === 'object' && json.course !== null,
        'course',
        'object'
    );
    assertField(
        'documentId' in json.course && typeof json.course.documentId === 'string',
        'documentId',
        'string'
    );
    assertField('tags' in json && Array.isArray(json.tags), 'tags', 'Array');

    const result = {
        id: json.documentId,
        presentationName: json.presentation_name,
        presentationDescription: json.presentation_description,
        presentationUrl: json.presentation_url,
        presentationPreviewUrl: getFullImagePath(json.presentation_preview.url),
        votedAuthors: await Promise.all(voted_people.map(parseVotedAuthor)),
        presentationOwners: await Promise.all(
            presentation_owners.map((author: object) => {
                assertField(
                    'documentId' in author && typeof author.documentId === 'string',
                    'documentId',
                    'string'
                );
                return getAuthorByDocumentId(author.documentId);
            })
        ),
        comments: await Promise.all(
            comments.map((author: object) => {
                assertField(
                    'documentId' in author && typeof author.documentId === 'string',
                    'documentId',
                    'string'
                );
                return getCommentByDocumentId(author.documentId);
            })
        ),
        tags: json.tags === null ? [] : await Promise.all(json.tags.map(parseTag)),
        courseDocumentId: json.course.documentId
    };
    assertValidPresentation(result);
    return result;
}

/**
 * This function parses the presentation tag from the json format into the {@linkcode Tag} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parseTag(json: unknown): Promise<Tag> {
    assert(typeof json === 'object' && json !== null, 'json must be object');
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );
    assertField('tag_name' in json && typeof json.tag_name === 'string', 'tag_name', 'string');
    const result = {
        id: json.documentId,
        name: json.tag_name
    };
    assertValidTag(result);
    return result;
}

async function parseCoursePreview(json: unknown): Promise<Course> {
    assert(typeof json === 'object' && json !== null, 'json must be object');

    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );

    assertField(
        'course_name' in json && typeof json.course_name === 'string',
        'course_name',
        'string'
    );

    assertField(
        'course_description' in json && typeof json.course_description === 'string',
        'course_description',
        'string'
    );

    assertField(
        'course_preview' in json && typeof json.course_preview === 'object',
        'course_preview',
        'object'
    );
    assert(json.course_preview !== null);

    assertField(
        'url' in json.course_preview && typeof json.course_preview.url === 'string',
        'url',
        'string'
    );

    const result = {
        id: json.documentId,
        courseName: json.course_name,
        courseDescription: json.course_description,
        coursePreviewUrl: getFullImagePath(json.course_preview.url),
        presentationCount: NaN,
        presentations: []
    };
    assertValidCourse(result);
    return result;
}

/**
 * This function parses the course from the json format into the {@linkcode Course} structure.
 * Be careful using it, as it contains a lot of asserts, and if it doesn't find any fields in the json file, it will crash with an error.
 * @param json input json course format
 */
async function parseCourse(json: unknown): Promise<Course> {
    assert(typeof json === 'object' && json !== null, 'json must be object');

    assertField(
        'presentation_count' in json && typeof json.presentation_count === 'number',
        'presentation_count',
        'number'
    );
    assertField(
        'documentId' in json && typeof json.documentId === 'string',
        'documentId',
        'string'
    );

    assertField(
        'course_name' in json && typeof json.course_name === 'string',
        'course_name',
        'string'
    );
    assertField(
        'course_description' in json && typeof json.course_description === 'string',
        'course_description',
        'string'
    );
    assertField(
        'presentations' in json && Array.isArray(json.presentations),
        'presentations',
        'Array'
    );
    assertField(
        'course_preview' in json &&
            typeof json.course_preview === 'object' &&
            json.course_preview != null,
        'course_preview',
        'object'
    );
    assertField(
        'url' in json.course_preview && typeof json.course_preview.url === 'string',
        'url',
        'string'
    );

    const result = {
        id: json.documentId,
        courseName: json.course_name,
        courseDescription: json.course_description,
        coursePreviewUrl: getFullImagePath(json.course_preview.url),
        presentationCount: json.presentation_count,
        presentations: await Promise.all(
            json.presentations.map((pres) => {
                assertField(
                    'documentId' in pres && typeof pres.documentId === 'string',
                    'documentId',
                    'string'
                );
                return getPresentationByDocumentId(pres.documentId);
            })
        )
    };
    assertValidCourse(result);
    return result;
}

const path = 'https://jenya-strapi-production.up.railway.app';
const strapi = new Strapi({
    url: path,
    prefix: '/api',
    store: {
        key: 'strapi_jwt',
        useLocalStorage: false
    }
});

/**
 * @param documentId the {@linkcode string} that Strapi generates by default
 *
 * @return {@linkcode Author} by documentId
 */
export async function getAuthorByDocumentId(documentId: string): Promise<Author> {
    const response = await strapi.findOne(`persons`, documentId, {
        populate: {
            companies: { populate: '*' },
            educations: { populate: '*' },
            skills: { populate: '*' },
            created_presentations: { populate: '*' },
            comments: { populate: '*' },
            favourites: { populate: '*' },
            progress_bars: { populate: '*' }
        }
    });
    const json: object = response.data;
    assert(json !== null);
    return parseAuthor(json);
}

/**
 * @param email the {@linkcode string} that the author must have
 *
 * @return {@linkcode Author} by eamil
 */
export async function getAuthorByEmail(email: string): Promise<Author> {
    const response = await strapi.find(`persons`, {
        filters: {
            person_email: email
        },
        populate: {
            companies: { populate: '*' },
            educations: { populate: '*' },
            skills: { populate: '*' },
            created_presentations: { populate: '*' },
            comments: { populate: '*' },
            favourites: { populate: '*' },
            progress_bars: {
                populate: '*'
            }
        }
    });
    const json: unknown = response.data.at(0);
    assert(json !== null);
    return parseAuthor(json);
}

/**
 * @return All {@linkcode Author}s from Strapi
 */
export async function getAllAuthors(): Promise<Author[]> {
    const response = await strapi.find('persons', {
        populate: {
            companies: { populate: '*' },
            educations: { populate: '*' },
            skills: { populate: '*' },
            created_presentations: { populate: '*' },
            comments: { populate: '*' },
            favourites: { populate: '*' },
            progress_bars: { populate: '*' },
            populate: '*'
        }
    });
    const json = response.data;
    assertField(Array.isArray(response.data), 'data', 'Array');

    console.log('All authors has this JSON:', json);
    return Promise.all(json.map(parseAuthor));
}

/**
 * @param documentId the {@linkcode string} that Strapi generates by default
 *
 * @return {@linkcode Presentation} by documentId
 */
export async function getPresentationByDocumentId(documentId: string): Promise<Presentation> {
    const response = await strapi.findOne(`presentations`, documentId, {
        populate: {
            presentation_owners: { populate: '*' },
            course: { populate: '*' },
            comments: { populate: '*' },
            presentation_preview: { populate: '*' },
            voted_people: { populate: '*' },
            tags: { populate: '*' }
        }
    });
    const json: object = response.data;
    assert(json !== null);
    return parsePresentation(json);
}

/**
 * @return All {@linkcode Presentation} from Strapi
 */
export async function getAllPresentations(): Promise<Presentation[]> {
    const response = await strapi.find('presentations', {
        populate: {
            presentation_owners: { populate: '*' },
            course: { populate: '*' },
            comments: { populate: '*' },
            presentation_preview: { populate: '*' },
            voted_people: { populate: '*' },
            tags: { populate: '*' }
        }
    });
    const json = response.data;
    assertField(Array.isArray(response.data), 'data', 'Array');

    console.log('All authors has this JSON:', json);
    return Promise.all(
        json.map((value) => {
            return parsePresentation(value);
        })
    );
}

/**
 * @param documentId the {@linkcode string} that Strapi generates by default
 *
 * @return {@linkcode AuthorComment} by documentId
 */
export async function getCommentByDocumentId(documentId: string): Promise<AuthorComment> {
    const response = await strapi.findOne(`comments`, documentId, { populate: '*' });
    const json: object = response.data;
    assert(json !== null);
    return parseComment(json);
}

/**
 * @return All {@linkcode AuthorComment} from Strapi
 */
export async function getAllComments(): Promise<AuthorComment[]> {
    const response = await strapi.find('comments?populate=*');
    const json = response.data;
    assertField(Array.isArray(response.data), 'data', 'Array');

    console.log('All authors has this JSON:', json);
    return await Promise.all(json.map(parseComment));
}

/**
 * @return All {@linkcode Course} from Strapi
 */
export async function getAllCourses(): Promise<Course[]> {
    const response = await strapi.find('courses', {
        populate: {
            presentations: {
                populate: {
                    presentation_owners: { populate: '*' },
                    course: { populate: '*' },
                    comments: { populate: '*' },
                    presentation_preview: { populate: '*' },
                    voted_people: { populate: '*' },
                    tags: { populate: '*' }
                }
            },
            course_preview: { populate: '*' }
        }
    });
    const json = response.data;
    assertField(Array.isArray(response.data), 'data', 'Array');

    console.log('All authors has this JSON:', json);
    return await Promise.all(json.map(parseCourse));
}

export async function getAllCoursePreviews(): Promise<Course[]> {
    const response = await strapi.find('courses', {
        populate: {
            course_preview: { populate: '*' }
        }
    });
    const json = response.data;
    assertField(Array.isArray(response.data), 'data', 'Array');

    return await Promise.all(json.map(parseCoursePreview));
}

/**
 * @param documentId the {@linkcode string} that Strapi generates by default
 *
 * @return {@linkcode Course} by documentId
 */
export async function getCourseByDocumentId(documentId: string): Promise<Course> {
    const response = await strapi.findOne('courses', documentId, {
        populate: {
            presentations: {
                populate: {
                    presentation_owners: { populate: '*' },
                    course: { populate: '*' },
                    comments: { populate: '*' },
                    presentation_preview: { populate: '*' },
                    voted_people: { populate: '*' },
                    tags: { populate: '*' }
                }
            },
            course_preview: { populate: '*' }
        }
    });
    const json: object = response.data;
    assert(json !== null);
    return parseCourse(json);
}

/**
 * @param documentId course's ID of {@linkcode string} type that Strapi generates by default
 *
 * @return {@linkcode Presentation}[] by documentId
 */
export async function getPresentationsByCourseDocumentId(
    documentId: string
): Promise<Presentation[]> {
    const response = await strapi.findOne('courses', documentId, {
        populate: {
            presentations: {
                populate: {
                    presentation_owners: { populate: '*' },
                    course: { populate: '*' },
                    comments: { populate: '*' },
                    presentation_preview: { populate: '*' },
                    voted_people: { populate: '*' },
                    tags: { populate: '*' }
                }
            },
            course_preview: { populate: '*' }
        }
    });
    const json: object = response.data;
    assert(json !== null);
    return (await parseCourse(json)).presentations;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode Author} for add to Strapi
 */
function getAuthorJson(
    name: string,
    email: string,
    address?: string,
    phone?: string,
    educations: Education[] = [],
    skills: Skill[] = [],
    presentations: Presentation[] = [],
    favourites: Favourite[] = [],
    progressBars: ProgressBar[] = [],
    comments: AuthorComment[] = []
): object {
    return {
        person_name: name,
        person_address: address,
        person_phone: phone,
        person_email: email,
        educations: getEducationsJson(educations),
        skills: getSkillsJson(skills),
        created_presentations: getPresentationsJson(presentations),
        comments: getCommentsJson(comments),
        favourites: getFavouritesJson(favourites),
        progress_bars: getProgressBarsJson(progressBars)
    };
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode ProgressBar} for add to Strapi
 */
function getProgressBarsJson(progressBars: ProgressBar[]) {
    const result = [];
    for (const progressBar of progressBars) {
        result.push(progressBar.id);
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode Comment} for add to Strapi
 */
function getCommentsJson(comments: AuthorComment[]) {
    const result = [];
    for (const comment of comments) {
        result.push({
            presentation: getAuthorJson(comment.author.name, comment.author.email.value),
            comment_description: comment.commentDescription
        });
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode Education} for add to Strapi
 */
function getEducationsJson(educations: Education[]) {
    const result = [];
    for (const education of educations) {
        result.push({
            education_name: education.title,
            education_level: education.subtitle,
            educate_start: education.timeRange.start,
            educate_end: education.timeRange.end
        });
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode Skill} for add to Strapi
 */
function getSkillsJson(skills: Skill[]) {
    const result = [];
    for (const skill of skills) {
        result.push({
            skill_name: skill.name,
            skill_percent: skill.value
        });
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode Presentation} for add to Strapi
 */
function getPresentationsJson(presentations: Presentation[]) {
    const result = [];
    for (const presentation of presentations) {
        result.push(presentation.id);
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode Favourite} for add to Strapi
 */
function getFavouritesJson(favourites: Favourite[]) {
    const result = [];
    for (const favourite of favourites) {
        result.push(favourite.id);
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode PresentationStatus} for add to Strapi
 */
function getPresentationStatusesJson(presentationStatuses: PresentationStatus[]) {
    const result = [];
    for (const presentationStatus of presentationStatuses) {
        result.push(presentationStatus.id);
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode VotedAuthor} for add to Strapi
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTagsJson(tags: Tag[]) {
    const result = [];
    for (const tag of tags) {
        result.push(tag.id);
    }
    return result;
}

/**
 *
 * This function is designed to bring out the general code and make it more beautiful.
 *
 * @return json-object of {@linkcode VotedAuthor} for add to Strapi
 */
function getVotedPersonsJson(votedPersons: VotedAuthor[]) {
    const result = [];
    for (const votedPerson of votedPersons) {
        result.push(votedPerson.id);
    }
    return result;
}

/**
 * You can only submit a name and email address for the function to work correctly.
 *
 * @param name {@linkcode Author} name
 * @param email {@linkcode Author} email
 * @param phone {@linkcode Author} phone
 * @param address {@linkcode Author} address
 * @param educations {@linkcode Author} educations or undefined
 * @param skills {@linkcode Author} skills or undefined
 * @param presentations {@linkcode Author} presentations or undefined
 * @param favourites {@linkcode Author} favourite presentations
 * @param progressBars {@linkcode Author} progress bars
 * @param comments {@linkcode Author} comments or undefined
 */
export async function addAuthor(
    name: string,
    email: string,
    phone: string = '',
    address: string = '',
    educations: Education[] = [],
    skills: Skill[] = [],
    presentations: Presentation[] = [],
    favourites: Favourite[] = [],
    progressBars: ProgressBar[] = [],
    comments: AuthorComment[] = []
) {
    await strapi.create(
        'persons',
        getAuthorJson(
            name,
            email,
            address,
            phone,
            educations,
            skills,
            presentations,
            favourites,
            progressBars,
            comments
        )
    );
}

/**
 * Adds a comment and a link to the author in Strapi
 *
 * @param commentDescription {@linkcode AuthorComment} description
 * @param authorDocumentId {@linkcode AuthorComment} documentId
 * @param presentationDocumentId
 */
export async function addComment(
    commentDescription: string,
    authorDocumentId: string,
    presentationDocumentId: string
) {
    const response = await strapi.create('comments', {
        comment_description: commentDescription,
        person: authorDocumentId,
        presentation: presentationDocumentId
    });
    console.log(response);
}

/**
 * For those who will draw pictures so as not to worry about the path.
 *
 * @param imageUrl image url. This url must be in the "key" format, and it should not contain http:// or anything like that.
 *
 * @return full path to image in Strapi
 */
export function getFullImagePath(imageUrl: string): string {
    return path + imageUrl;
}

/**
 * The function finds the presentation of the document ID from the author and deletes it from the Strapi database
 *
 * @param author we want to delete his favorite presentation from Strapi database
 * @param presentationDocumentId of deleted presentation
 */
export async function deleteFavouritePresentation(
    author: Author,
    presentationDocumentId: string
): Promise<void> {
    const favourite = author.favourites.find(
        (value) => value.presentationDocumentId === presentationDocumentId
    );
    assert(
        !(favourite === null || favourite === undefined),
        'No valid presentation document id found.'
    );
    const response = await strapi.delete('favourites', favourite.id);
    console.log(response);
}

/**
 * The function creates a Favorite object in the Storage database, finds its document id, and adds a relation to the author.
 *
 * @param author we want to add his new favorite presentation to Strapi database
 * @param presentationDocumentId of added presentation
 */
export async function addFavouritePresentation(
    author: Author,
    presentationDocumentId: string
): Promise<void> {
    const favourite = {
        person_document_id: author.id,
        presentation_document_id: presentationDocumentId,
        person: author.id
    };
    const favouriteResponse = await strapi.create('favourites', favourite);
    const favouriteDocumentId = await strapi
        .find('favourites', {
            filters: {
                person_document_id: author.id,
                presentation_document_id: presentationDocumentId
            }
        })
        .then((value) => value.data.documentId);
    await strapi
        .update('persons', author.id, {
            favourites: getFavouritesJson(author.favourites).push(favouriteDocumentId)
        })
        .catch(() => {});
    console.log(favouriteResponse);
}

/**
 * The function finds the desired progress bar from the author by courseDocumentId, then in this progress bar it finds the desired presentation by presentationDocumentId and deletes it along with all relations
 *
 * @param author author we want to delete the read presentation from Strapi database
 * @param courseDocumentId the author is studying at
 * @param presentationDocumentId we want to delete
 */
export async function deleteProgressPresentation(
    author: Author,
    courseDocumentId: string,
    presentationDocumentId: string
): Promise<void> {
    const progressBar = author.progressBars.find(
        (value) => value.courseDocumentId === courseDocumentId
    );
    if (progressBar === undefined) {
        console.log(`Can't find progress bar of course ${courseDocumentId}`);
        return;
    }
    const presentationStatus = progressBar.presentations.find(
        (value) => value.presentationDocumentId === presentationDocumentId
    );
    if (presentationStatus === undefined) {
        console.log(`Can't find progress bar of presentation ${presentationDocumentId}`);
        return;
    }
    const response = await strapi.delete('presentation-statuses', presentationStatus.id);
    console.log(response);
}

/**
 * The function finds the desired progress bar from the author by courseDocumentId, creates a new object in the presentationStatuses and adds a relation between them.
 *
 * @param author who read the new presentation
 * @param courseDocumentId that the author is taking
 * @param presentationDocumentId presentation he read
 */
export async function addProgressPresentation(
    author: Author,
    courseDocumentId: string,
    presentationDocumentId: string
): Promise<void> {
    let progressBar = author.progressBars.find(
        (value) => value.courseDocumentId === courseDocumentId
    );
    if (progressBar === null || progressBar === undefined) {
        progressBar = await addProgressBar(author, courseDocumentId);
    }
    const status = progressBar.presentations.find(
        (value) => value.presentationDocumentId === presentationDocumentId
    );
    if (!(status === null || status === undefined)) {
        return;
    }
    await strapi.create('presentation-statuses', {
        progress_bar: progressBar.id,
        progress_bar_document_id: progressBar.id,
        presentation_document_id: presentationDocumentId
    });
    const presentationStatus = await strapi.find('presentation-statuses', {
        filters: {
            progress_bar_document_id: progressBar.id,
            presentation_document_id: presentationDocumentId
        }
    });
    assert(
        typeof presentationStatus.data[0] === 'object' && presentationStatus.data[0] !== null,
        'Error during create presentation status'
    );
    assertField(
        'documentId' in presentationStatus.data[0] &&
            typeof presentationStatus.data[0].documentId === 'string',
        'documentId',
        'string'
    );
    await strapi
        .update('progress-bars', progressBar.id, {
            presentation_statuses: getPresentationStatusesJson(progressBar.presentations).push(
                presentationStatus.data[0].documentId
            )
        })
        .catch(() => {});
}

/**
 * This feature creates a new progress bar for the user. It should be called every time a new user who does not have a progress bar for this course enters the course or registers on the course page.
 *
 * @param author who needs to add a new progress bar
 * @param courseDocumentId tracked by this progress bar
 */
export async function addProgressBar(
    author: Author,
    courseDocumentId: string
): Promise<ProgressBar> {
    await strapi.create('progress-bars', {
        person_document_id: author.id,
        course_document_id: courseDocumentId,
        person: author.id,
        presentation_statuses: []
    });
    const createdProgressBar = await strapi.find('progress-bars', {
        filters: {
            person_document_id: author.id,
            course_document_id: courseDocumentId
        },
        populate: '*'
    });
    assert(
        typeof createdProgressBar.data[0] === 'object' && createdProgressBar.data[0] !== null,
        'Strapi error (Error during create progress bar)'
    );
    const progressBar = await parseProgressBar(createdProgressBar.data[0]);
    await strapi
        .update('authors', author.id, {
            progress_bars: getProgressBarsJson(author.progressBars).push(progressBar.id)
        })
        .catch(() => {});
    return progressBar;
}

/**
 * The function finds the author's voice in the presentation by authorDocumentId and deletes it.
 *
 * @param author we want to delete the voice from Strapi database
 * @param presentation from which we want to remove the score
 */
export async function deleteVotedAuthor(author: Author, presentation: Presentation): Promise<void> {
    const votedAuthorDocumentId = presentation.votedAuthors.find(
        (value) => value.authorDocumentId === author.id
    );
    assert(
        !(votedAuthorDocumentId === null || votedAuthorDocumentId === undefined),
        'No valid voted author document id found.'
    );
    const votedAuthorResponse = await strapi.delete('voted-people', votedAuthorDocumentId.id);
    console.log(votedAuthorResponse);
}

/**
 * The function creates a new score, and then adds a relationship between it and the presentation.
 *
 * @param author who gave the score
 * @param presentation that the author appreciated
 * @param authorScore he gave to this presentation
 */
export async function addVotedAuthor(
    author: Author,
    presentation: Presentation,
    authorScore: number
): Promise<void> {
    assert(authorScore < 11, 'Author score must be in range [0, 11]');
    const currentVotedAuthor = presentation.votedAuthors.find(
        (value) => value.authorDocumentId === author.id
    );
    if (!(currentVotedAuthor === null || currentVotedAuthor === undefined)) {
        return;
    }
    const data = {
        presentation_document_id: presentation.id,
        person_document_id: author.id,
        presentation: presentation.id,
        person_score: authorScore
    };
    const votedAuthorResponse = await strapi.create('voted-people', data).catch(() => {});
    console.log(votedAuthorResponse);
    const votedAuthor = await strapi
        .find('voted-people', {
            filters: {
                presentation_document_id: presentation.id,
                person_document_id: author.id,
                person_score: authorScore
            }
        })
        .then((value) => value.data.documentId);
    const presentationResponse = await strapi
        .update('presentations', presentation.id, {
            voted_people: getVotedPersonsJson(presentation.votedAuthors).push(votedAuthor)
        })
        .catch(() => {});
    console.log(presentationResponse);
}

/**
 * A function that returns true if the author has already voted and false otherwise
 *
 * @param author we are checking
 * @param presentation we are reviewing
 */
export async function isAuthorVote(author: Author, presentation: Presentation) {
    for (const votedAuthor of presentation.votedAuthors) {
        if (votedAuthor.authorDocumentId === author.id) {
            return true;
        }
    }
    return false;
}
