package com.service.adspark.dto.request.analyticsmanagement;


import com.service.adspark.model.enums.MetricType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetricsRequest {

    private Long advertisementId;
    private MetricType metricType = MetricType.DAILY;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    private String groupBy; // "day", "hour", "country", "device", etc.
    private Boolean includeUserDetails = false;
}