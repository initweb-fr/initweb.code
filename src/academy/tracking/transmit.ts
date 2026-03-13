/*import { getCookie, setCookie } from '$utils/--global/cookieUtilities';
import { getFunnelDatas } from '$utils/--global/tracking/funnel/getFunnelDatas';
import { getMemberDatas } from 'src/academy/members/data';


export async function sendFunnelDatasToWebhook(): Promise<void> {
  //Récupération des données du funnel
  const webhookUrl = 'https://hook.eu1.make.com/jwy2aodfw6bybp7gribq53rpqjwpfyuu';
  // Infos du Funnel
  const funnelDatas = getFunnelDatas();
  // Infos de l'utilisateur
  const userData = await getMemberDatas();
  const userDataMSID = userData?.memberDATAS?.id;
  const userDataEmail = userData?.memberDATAS?.auth?.email;
  const userDataFirstName = userData?.memberDATAS?.customFields?.['first-name'] || '';
  const userDataLastName = userData?.memberDATAS?.customFields?.['last-name'] || '';
  // Infos du cours
  const courseID = getCookie('__iw_funnel_course_iwid');
  const courseStatusDatas = getCookie('__iw_funnel_course_' + courseID + '_datas_status');
  console.log('funnelDatas', funnelDatas);
  console.log('userData', userData);
  console.log('courseId', courseID);
  // Si courseStatusDatas a pour valeur "saved", on arrête la fonction
  if (courseStatusDatas === 'sent') {
    return;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        //
        FUNNEL_Device_Support: funnelDatas.userDevice.deviceSupport,
        FUNNEL_Device_Lang: funnelDatas.userDevice.deviceLang,
        //
        FUNNEL_Page_Current: funnelDatas.userNavigation.currentPage,
        FUNNEL_Page_Previous: funnelDatas.userNavigation.previousPage,
        //
        FUNNEL_UTM_Campaign: funnelDatas.userUTM.utmCampaign,
        FUNNEL_UTM_Content: funnelDatas.userUTM.utmContent,
        FUNNEL_UTM_Medium: funnelDatas.userUTM.utmMedium,
        FUNNEL_UTM_Source: funnelDatas.userUTM.utmSource,
        FUNNEL_UTM_Term: funnelDatas.userUTM.utmTerm,
        //
        FUNNEL_CourseID: courseID,
        //
        USER_MSID: userDataMSID,
        USER_Email: userDataEmail,
        USER_FirstName: userDataFirstName,
        USER_LastName: userDataLastName,
      }),
    });
    // Si la réponse est OK, on met à jour le status du cours
    if (response.ok) {
      setCookie('__iw_funnel_course_' + courseID + '_datas_status', 'sent');
    }
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    console.log('Données du funnel envoyées avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi des données du funnel:", error);
    throw error;
  }
}
*/
