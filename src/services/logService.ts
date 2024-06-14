import AWS from 'aws-sdk';

// AWS SDK 설정
AWS.config.update({
  region: 'ap-northeast-2', // 원하는 리전으로 변경
});



const cloudWatchLogs = new AWS.CloudWatchLogs();

/**
 * 로그 그룹 목록을 가져오는 함수
 */
export async function listLogGroups(): Promise<AWS.CloudWatchLogs.LogGroup[]> {
  try {
    const response = await cloudWatchLogs.describeLogGroups().promise();
    return response.logGroups || [];
  } catch (error) {
    console.error('Error listing log groups:', error);
    throw error;
  }
}

/**
 * 특정 로그 그룹의 로그 스트림 목록을 가져오는 함수
 */
export async function listLogStreams(logGroupName: string): Promise<AWS.CloudWatchLogs.LogStream[]> {
  try {
    const response = await cloudWatchLogs.describeLogStreams({ logGroupName }).promise();
    return response.logStreams || [];
  } catch (error) {
    console.error('Error listing log streams:', error);
    throw error;
  }
}

/**
 * 특정 로그 스트림의 로그 이벤트를 가져오는 함수
 */
export async function getLogEvents(logGroupName: string, logStreamName: string): Promise<AWS.CloudWatchLogs.OutputLogEvent[]> {
  try {
    const response = await cloudWatchLogs.getLogEvents({
      logGroupName,
      logStreamName,
    }).promise();

    return response.events || [];
  } catch (error) {
    console.error('Error getting log events:', error);
    throw error;
  }
}
